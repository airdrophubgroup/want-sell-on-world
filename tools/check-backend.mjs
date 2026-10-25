#!/usr/bin/env node
// Backend health check for the exact Supabase project the app ships with.
//
//   npm run check:backend
//
// It reads SUPABASE_URL / SUPABASE_KEY straight out of app.js, so it can never
// drift from what the browser bundle uses, and it answers the questions the app
// only surfaces as "Network error":
//   * does the project hostname resolve at all? (paused/deleted projects do not)
//   * is the anon key accepted?
//   * do the tables the app queries still exist?
//   * does the photo bucket exist?
//   * is the SOW award RPC installed?
//
// Exit code 0 = backend healthy, 1 = at least one check failed.

import { readFileSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSrc = readFileSync(join(root, 'app.js'), 'utf8');
const url = (appSrc.match(/const SUPABASE_URL = '([^']+)'/) || [])[1];
const key = (appSrc.match(/const SUPABASE_KEY = '([^']+)'/) || [])[1];

const TABLES = ['listings', 'users', 'chats', 'reviews', 'sow_balances'];
const results = [];
const ok = (name, detail) => results.push({ status: 'ok', name, detail });
const warn = (name, detail) => results.push({ status: 'warn', name, detail });
const bad = (name, detail) => results.push({ status: 'fail', name, detail });

function line(status, name, detail) {
  const mark = status === 'ok' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
  console.log(`${mark}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function main() {
  console.log('WantSell backend check\n======================');

  if (!url || !key) {
    bad('config', 'SUPABASE_URL / SUPABASE_KEY not found in app.js');
    return finish();
  }
  console.log(`Project : ${url}`);
  try {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    console.log(`Key role: ${claims.role || 'unknown'}  (ref ${claims.ref || 'n/a'})`);
    if (claims.role && claims.role !== 'anon') {
      warn('key role', `the client bundle uses a "${claims.role}" key; it must be the anon/publishable key`);
    }
  } catch {
    console.log('Key role: (publishable key, not a JWT)');
  }

  // 1. DNS ------------------------------------------------------------------
  const host = new URL(url).hostname;
  let resolved = true;
  try {
    const addr = await lookup(host);
    ok('dns', `${host} -> ${addr.address}`);
  } catch (err) {
    resolved = false;
    bad('dns', `${host} does not resolve (${err.code || err.message}). ` +
      'A Supabase project that is paused or deleted stops answering DNS: open the ' +
      'dashboard, pick the project, and press "Resume project" (free projects pause ' +
      'after about a week of inactivity).');
  }

  if (!resolved) {
    warn('rest', 'skipped: no host to talk to');
    warn('tables', 'skipped');
    warn('storage', 'skipped');
    warn('rpc', 'skipped');
    return finish();
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const base = url.replace(/\/$/, '');

  // 2. REST root ------------------------------------------------------------
  try {
    const res = await fetch(`${base}/rest/v1/`, { headers });
    if (res.status === 401 || res.status === 403) {
      bad('rest', `HTTP ${res.status}: the anon key is not valid for this project (or it was rotated)`);
    } else if (res.ok) {
      ok('rest', `HTTP ${res.status}`);
    } else {
      warn('rest', `HTTP ${res.status} (unexpected but reachable)`);
    }
  } catch (err) {
    bad('rest', `request failed: ${err.message}`);
  }

  // 3. Tables --------------------------------------------------------------
  for (const table of TABLES) {
    try {
      const res = await fetch(`${base}/rest/v1/${table}?select=*&limit=1`, { headers });
      if (res.status === 200) {
        ok(`table ${table}`, 'readable with the anon key');
      } else if (res.status === 404) {
        const body = await res.text();
        bad(`table ${table}`, body.includes('PGRST205')
          ? 'missing from the schema (run SUPABASE_SQL_SCHEMA.sql)'
          : `HTTP 404 ${body.slice(0, 120)}`);
      } else if (res.status === 401 || res.status === 403) {
        bad(`table ${table}`, `HTTP ${res.status}: RLS or grants block the anon key`);
      } else {
        await res.body?.cancel();
        warn(`table ${table}`, `HTTP ${res.status}`);
      }
    } catch (err) {
      bad(`table ${table}`, `request failed: ${err.message}`);
    }
  }

  // 4. Storage -------------------------------------------------------------
  try {
    const res = await fetch(`${base}/storage/v1/bucket/listing`, { headers });
    if (res.ok) {
      const bucket = await res.json().catch(() => null);
      ok('storage bucket listing', bucket && bucket.public ? 'public bucket found' : 'bucket found');
    } else if (res.status === 400 || res.status === 404) {
      bad('storage bucket listing', 'bucket "listing" is missing (create a public bucket named listing)');
    } else {
      await res.body?.cancel();
      warn('storage bucket listing', `HTTP ${res.status}`);
    }
  } catch (err) {
    bad('storage bucket listing', `request failed: ${err.message}`);
  }

  // 5. SOW RPC -------------------------------------------------------------
  try {
    const res = await fetch(`${base}/rest/v1/rpc/award_sow_for_listing`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_ad_id: -1 }),
    });
    const body = await res.text();
    if (res.status === 404) {
      bad('rpc award_sow_for_listing', 'not installed (run SUPABASE_SQL_SOW_SECURITY.sql)');
    } else if (res.status === 200 && body.includes('listing_not_found')) {
      ok('rpc award_sow_for_listing', 'installed and refuses unknown listings');
    } else if (res.status === 200) {
      warn('rpc award_sow_for_listing', `unexpected payload: ${body.slice(0, 120)}`);
    } else {
      bad('rpc award_sow_for_listing', `HTTP ${res.status} ${body.slice(0, 120)}`);
    }
  } catch (err) {
    bad('rpc award_sow_for_listing', `request failed: ${err.message}`);
  }

  return finish();
}

function finish() {
  console.log('\nSummary\n-------');
  for (const r of results) line(r.status, r.name, r.detail);
  const failures = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warn').length;
  console.log(`\n${results.length - failures - warnings} passed, ${warnings} warnings, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error('check failed:', err);
  process.exit(1);
});
