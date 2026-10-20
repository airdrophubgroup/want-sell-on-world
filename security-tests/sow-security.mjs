#!/usr/bin/env node
/**
 * SOW credit system — security test suite.
 *
 *   node security-tests/sow-security.mjs --static-only
 *   node security-tests/sow-security.mjs                 # live attacks, small
 *   node security-tests/sow-security.mjs --burst 400     # 400 concurrent users
 *
 * Live mode talks to the Supabase project with the SAME public anon key the
 * browser uses, i.e. it behaves exactly like a hostile visitor.
 *
 * Exit codes: 0 all passed, 1 assertion failed, 2 could not run.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSrc = readFileSync(join(root, 'app.js'), 'utf8');

const args = process.argv.slice(2);
const staticOnly = args.includes('--static-only');
const burstArg = args.find((a) => a.startsWith('--burst=')) || (args.includes('--burst') ? `--burst=${args[args.indexOf('--burst') + 1]}` : null);
const BURST = burstArg ? Math.max(0, parseInt(burstArg.split('=')[1], 10) || 0) : 0;

const URL_BASE = process.env.SUPABASE_URL || (appSrc.match(/const SUPABASE_URL = '([^']+)'/) || [])[1];
const ANON_KEY = process.env.SUPABASE_ANON_KEY || (appSrc.match(/const SUPABASE_KEY = '([^']+)'/) || [])[1];

// Some terminals (and CI wrappers) swallow child stdout, so every line is also
// buffered and can be written to a report file with --report <path>.
const log = [];
const out = (line = '') => { console.log(line); log.push(line); };
const reportArgIdx = args.indexOf('--report');
const reportPath = reportArgIdx !== -1 ? args[reportArgIdx + 1] : null;
const flush = () => { if (reportPath) writeFileSync(reportPath, log.join('\n') + '\n'); };

let failures = 0;
let passes = 0;
const pass = (m) => { passes++; out(`  PASS  ${m}`); };
const fail = (m) => { failures++; out(`  FAIL  ${m}`); };
const skip = (m) => out(`  SKIP  ${m}`);
const section = (m) => out(`\n${m}`);

// ---------------------------------------------------------------- static
section('Static checks (bundle cannot mint SOW)');
{
  const writes = appSrc.match(/from\('sow_balances'\)\.(insert|upsert|update|delete)/g) || [];
  writes.length === 0 ? pass('no browser writes to sow_balances') : fail(`browser still writes sow_balances: ${writes.join(', ')}`);

  const ledgerUse = /from\('sow_ledger'\)/.test(appSrc) || /rpc\('.*ledger/.test(appSrc);
  !ledgerUse ? pass('browser never touches sow_ledger') : fail('browser references sow_ledger');

  const awardCalls = appSrc.match(/rpc\('award_sow_for_listing'/g) || [];
  awardCalls.length === 1 ? pass('posting awards via award_sow_for_listing RPC exactly once') : fail(`expected 1 award RPC call, found ${awardCalls.length}`);

  /setSowBalance\(award\.balance\)/.test(appSrc)
    ? pass('displayed balance comes from the server response')
    : fail('UI does not use the server-returned balance');

  /sow_balances'\)[\s\S]{0,40}\.select\('balance'\)/.test(appSrc)
    ? pass('balance reads are still read-only selects')
    : skip('no balance read found (schema changed?)');
}

if (staticOnly) {
  out(`\n${passes} passed, ${failures} failed`);
  flush();
  process.exit(failures ? 1 : 0);
}

// ---------------------------------------------------------------- helpers
const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...headers, Prefer: prefer } : headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* plain text */ }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 300) };
}

const walletFor = (i) => '0x' + (i.toString(16).padStart(6, '0') + randomBytes(17).toString('hex')).slice(0, 40);
const runId = Date.now().toString(36);
const createdIds = [];

async function insertListing(seller) {
  const body = {
    seller_address: seller,
    seller_name: `sec-test-${runId}`,
    title: `SEC TEST ${runId} ${randomBytes(3).toString('hex')}`,
    description: 'automated security test fixture',
    price: '1.00',
    category: 'Other',
    country: 'US',
    address: 'test fixture',
    lat: 40.7,
    lng: -74.0,
    condition: 'used',
    price_type: 'fixed',
    image1: 'https://example.com/x.jpg',
    status: 'active',
  };
  const res = await rest('listings', { method: 'POST', body: [body], prefer: 'return=representation' });
  if (!res.ok) return { error: `${res.status} ${res.text}` };
  const row = Array.isArray(res.json) ? res.json[0] : res.json;
  if (row && row.id != null) createdIds.push(row.id);
  return { id: row ? row.id : null };
}

async function balanceOf(wallet) {
  const res = await rest(`sow_balances?wallet_address=eq.${wallet.toLowerCase()}&select=balance`);
  if (!res.ok) return null;
  return Array.isArray(res.json) && res.json[0] ? Number(res.json[0].balance) : 0;
}

async function award(adId) {
  return rest('rpc/award_sow_for_listing', { method: 'POST', body: { p_ad_id: adId } });
}

async function canReach() {
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/`, { headers });
    return res.status > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- live
if (!(await canReach())) {
  out(`\nCannot reach ${URL_BASE} from this machine (DNS/network).`);
  out('Run this suite where the project is reachable, e.g. your machine with the app open.');
  flush();
  process.exit(2);
}

section('Attack 1-2: visitor tries to write balances directly');
{
  const w = walletFor(1);
  const upsert = await rest('sow_balances', {
    method: 'POST',
    body: [{ wallet_address: w, balance: 999999 }],
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  if (!upsert.ok || (Array.isArray(upsert.json) && upsert.json.length === 0)) {
    pass(`direct balance upsert blocked (${upsert.status})`);
  } else {
    const bal = await balanceOf(w);
    bal === 0 ? pass('upsert returned no change') : fail(`attacker set balance to ${bal}`);
  }

  const insert = await rest('sow_balances', {
    method: 'POST',
    body: [{ wallet_address: walletFor(2), balance: 5 }],
    prefer: 'return=representation',
  });
  insert.ok && Array.isArray(insert.json) && insert.json.length > 0
    ? fail('direct balance insert accepted')
    : pass(`direct balance insert blocked (${insert.status})`);
}

section('Attack 3: visitor tries to write the ledger directly');
{
  const res = await rest('sow_ledger', {
    method: 'POST',
    body: [{ listing_id: 1, wallet_address: walletFor(3), amount: 1000 }],
    prefer: 'return=representation',
  });
  res.ok && Array.isArray(res.json) && res.json.length > 0
    ? fail('client can INSERT into sow_ledger')
    : pass(`ledger insert blocked (${res.status})`);
}

section('Genuine user: one listing earns exactly one coin');
let fixture = null;
{
  const seller = walletFor(10);
  const created = await insertListing(seller);
  if (created.error) {
    skip(`could not create fixture listing (${created.error})`);
  } else {
    fixture = created.id;
    const before = (await balanceOf(seller)) ?? 0;
    const r1 = await award(fixture);
    const bal1 = r1.json && r1.json.balance != null ? Number(r1.json.balance) : null;
    (r1.ok && r1.json && r1.json.awarded === true) ? pass('first award credited') : fail(`first award rejected: ${r1.status} ${r1.text}`);
    bal1 === before + 1 ? pass(`balance ${before} -> ${bal1}`) : fail(`expected ${before + 1}, got ${bal1}`);

    const r2 = await award(fixture);
    const bal2 = r2.json && r2.json.balance != null ? Number(r2.json.balance) : (await balanceOf(seller));
    (r2.json && r2.json.awarded === false) ? pass('second award refused (idempotent)') : fail(`second award granted: ${r2.text}`);
    bal2 === bal1 ? pass('balance unchanged after second award') : fail(`balance moved ${bal1} -> ${bal2}`);
  }
}

section('Race: 50 simultaneous awards on one listing');
if (fixture == null) {
  skip('no fixture listing available');
} else {
  const seller = (await rest(`listings?id=eq.${fixture}&select=seller_address`)).json?.[0]?.seller_address;
  const before = (await balanceOf(seller)) ?? 0;
  const results = await Promise.all(Array.from({ length: 50 }, () => award(fixture)));
  const granted = results.filter((r) => r.json && r.json.awarded === true).length;
  const after = (await balanceOf(seller)) ?? 0;
  granted === 0 ? pass('no duplicate credits under concurrency') : fail(`${granted} concurrent awards granted`);
  after === before + 1 ? pass(`balance moved by exactly 1 (${before} -> ${after})`) : fail(`balance moved by ${after - before}`);
}

section('Rejected input: unknown and stale listings');
{
  const unknown = await award(999999999);
  (unknown.json && unknown.json.awarded === false) ? pass('unknown listing refused') : fail(`unknown listing accepted: ${unknown.text}`);

  const stale = await insertListing(walletFor(11));
  if (stale.error) {
    skip(`could not create stale fixture (${stale.error})`);
  } else {
    const patch = await rest(`listings?id=eq.${stale.id}`, {
      method: 'PATCH',
      body: { created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    });
    if (!patch.ok) {
      skip(`cannot backdate fixture (${patch.status}); freshness check needs a manual test`);
    } else {
      const res = await award(stale.id);
      (res.json && res.json.awarded === false)
        ? pass('listing older than 10 minutes refused')
        : fail(`stale listing credited: ${res.text}`);
    }
  }
}

section(`Scale: ${BURST} distinct users post at once`);
if (BURST < 2) {
  skip('pass --burst 400 to run the multi-user test');
} else {
  const sellers = Array.from({ length: BURST }, (_, i) => walletFor(1000 + i));
  const listings = await Promise.all(sellers.map((s) => insertListing(s)));
  const ok = listings.filter((l) => l.id != null);
  if (ok.length < BURST) {
    skip(`only ${ok.length}/${BURST} fixtures created (RLS likely blocks client inserts — that is stricter, not worse)`);
  }
  if (ok.length > 0) {
    const awards = await Promise.all(ok.map((l) => award(l.id)));
    const granted = awards.filter((r) => r.json && r.json.awarded === true).length;
    granted === ok.length
      ? pass(`${granted}/${ok.length} users credited once each`)
      : fail(`${granted} credits for ${ok.length} listings`);

    const balances = await Promise.all(sellers.slice(0, ok.length).map((s) => balanceOf(s)));
    const wrong = balances.filter((b) => b !== 1).length;
    wrong === 0 ? pass('every wallet has exactly 1 SOW') : fail(`${wrong} wallets deviated from 1`);
  }
}

section('Cleanup');
{
  if (createdIds.length === 0) {
    skip('nothing to clean up');
  } else {
    const del = await rest(`listings?id=in.(${createdIds.join(',')})`, { method: 'DELETE' });
    del.ok ? pass(`removed ${createdIds.length} test listings`) : skip(`cleanup blocked (${del.status}) — delete SEC TEST ${runId} rows manually`);
    const led = await rest(`sow_ledger?reason=eq.listing_posted&select=listing_id&limit=1`);
    if (led.ok) skip('sow_ledger kept as audit trail (by design)');
  }
}

out(`\n${passes} passed, ${failures} failed`);
flush();
process.exit(failures ? 1 : 0);
