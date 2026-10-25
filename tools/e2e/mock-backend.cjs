// Local PostgREST stand-in for UI testing while the hosted Supabase project is
// paused. Implements only what app.js actually calls.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3457;
const LOG_PATH = path.join(__dirname, 'mock.log');
// Set MOCK_DELAY_MS to simulate a real mobile round trip and measure the feed
// honestly instead of on a loopback connection.
const DELAY_MS = Number(process.env.MOCK_DELAY_MS || 0);
const hits = {};
const USER = '0x8c5b20653abcb87f6b3a7cb469d8623e94bfb6a1';
const SELLER = '0xaaa1111111111111111111111111111111111111';
const BUYER = '0xbbb2222222222222222222222222222222222222';

const db = {
  users: [
    { wallet_address: USER, username: 'airdrophuman' },
    { wallet_address: SELLER, username: 'seller_one' },
    { wallet_address: BUYER, username: 'buyer_two' },
  ],
  listings: [
    { id: 1, seller_address: SELLER, seller_name: 'seller_one', title: 'iPhone 15 Pro Max', description: 'Barely used, 256GB, with box and charger.', price: '620.00', category: 'Electronics', country: 'IN', address: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, condition: 'like_new', price_type: 'negotiable', image1: 'https://images.example.com/phone.jpg', image2: '', image3: '', image4: '', status: 'active', created_at: new Date(Date.now() - 3600e3).toISOString() },
    { id: 2, seller_address: BUYER, seller_name: 'buyer_two', title: 'Wooden study table', description: 'Solid wood table, minor scratch on one leg.', price: '45.00', category: 'Home Appliances', country: 'IN', address: 'Andheri East, Mumbai', lat: 19.1136, lng: 72.8697, condition: 'good', price_type: 'fixed', image1: 'https://images.example.com/table.jpg', image2: '', image3: '', image4: '', status: 'active', created_at: new Date(Date.now() - 7200e3).toISOString() },
    { id: 3, seller_address: USER, seller_name: 'airdrophuman', title: 'My old bicycle', description: 'City bike, serviced last month, new tyres.', price: '80.00', category: 'Books & Sports', country: 'IN', address: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060, condition: 'used', price_type: 'fixed', image1: 'https://images.example.com/bike.jpg', image2: '', image3: '', image4: '', status: 'active', created_at: new Date(Date.now() - 900e3).toISOString() },
    { id: 4, seller_address: USER, seller_name: 'airdrophuman', title: 'Sold desk lamp', description: 'Already sold, kept for history.', price: '10.00', category: 'Home Appliances', country: 'IN', address: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060, condition: 'used', price_type: 'fixed', image1: '', image2: '', image3: '', image4: '', status: 'sold', created_at: new Date(Date.now() - 86400e3).toISOString() },
    { id: 5, seller_address: SELLER, seller_name: 'seller_one', title: 'Deleted ad', description: 'Hidden from the feed.', price: '1.00', category: 'Other', country: 'IN', address: 'x', lat: 19.0, lng: 72.8, condition: 'used', price_type: 'fixed', image1: '', image2: '', image3: '', image4: '', status: 'deleted', created_at: new Date(Date.now() - 172800e3).toISOString() },
  ],
  chats: [
    { id: 1, sender: USER, receiver: SELLER, ad_title: 'iPhone 15 Pro Max', message: 'Hi, is this still available?', created_at: new Date(Date.now() - 600e3).toISOString() },
    { id: 2, sender: SELLER, receiver: USER, ad_title: 'iPhone 15 Pro Max', message: 'Yes it is, come see it today.', created_at: new Date(Date.now() - 500e3).toISOString() },
    { id: 3, sender: BUYER, receiver: SELLER, ad_title: 'iPhone 15 Pro Max', message: 'Different conversation', created_at: new Date(Date.now() - 400e3).toISOString() },
  ],
  reviews: [
    { id: 1, seller_address: SELLER, buyer_address: BUYER, buyer_name: 'buyer_two', rating: 5, comment: 'Smooth deal, item as described.', created_at: new Date(Date.now() - 86400e3).toISOString() },
    { id: 2, seller_address: SELLER, buyer_address: USER, buyer_name: 'airdrophuman', rating: 4, comment: 'Good communication.', created_at: new Date(Date.now() - 172800e3).toISOString() },
  ],
  sow_balances: [
    { wallet_address: USER, balance: 7 },
    { wallet_address: SELLER, balance: 3 },
    { wallet_address: BUYER, balance: 1 },
  ],
  sow_ledger: [],
};

const seq = { listings: 100, chats: 100, reviews: 100 };
// Snapshot of the seed data so a second suite run starts from the same state
// instead of inheriting the previous run's listings, reviews and balances.
const SEED_DB = JSON.parse(JSON.stringify(db));
const SEED_SEQ = Object.assign({}, seq);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,prefer,accept,range,x-client-info',
  'Access-Control-Expose-Headers': 'content-range',
};

function log(line) {
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function json(res, status, body, extra = {}) {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json', ...extra });
  res.end(text);
}

function splitTop(str, sep) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function parseExpr(expr) {
  // and(a.eq.1,b.eq.2) | or(...) | column.op.value
  const m = expr.match(/^(and|or)\((.*)\)$/);
  if (m) {
    const parts = splitTop(m[2], ',').map(parseExpr);
    return (row) => m[1] === 'and' ? parts.every((f) => f(row)) : parts.some((f) => f(row));
  }
  const dot = expr.indexOf('.');
  if (dot < 0) return () => true;
  const col = expr.slice(0, dot);
  const rest = expr.slice(dot + 1);
  const opDot = rest.indexOf('.');
  const op = opDot < 0 ? rest : rest.slice(0, opDot);
  const raw = opDot < 0 ? '' : rest.slice(opDot + 1);
  switch (op) {
    case 'eq': return (row) => String(row[col] ?? '') === raw;
    case 'neq': return (row) => String(row[col] ?? '') !== raw;
    case 'gt': return (row) => Number(row[col]) > Number(raw);
    case 'lt': return (row) => Number(row[col]) < Number(raw);
    case 'ilike': return (row) => new RegExp('^' + raw.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i').test(String(row[col] ?? ''));
    case 'like': return (row) => new RegExp('^' + raw.replace(/%/g, '.*') + '$').test(String(row[col] ?? ''));
    case 'in': {
      const list = raw.replace(/^\(|\)$/g, '').split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      return (row) => list.includes(String(row[col] ?? ''));
    }
    case 'is': return (row) => raw === 'null' ? row[col] == null : String(row[col]) === raw;
    default: return (row) => true;
  }
}
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function table(name) { return db[name] || (db[name] = []); }

function applyQuery(rows, params) {
  let out = rows.slice();
  const orExpr = params.get('or');
  const andExpr = params.get('and');
  if (orExpr) {
    const pred = parseExpr('or(' + orExpr.replace(/^\(|\)$/g, '') + ')');
    out = out.filter(pred);
  }
  if (andExpr) {
    const pred = parseExpr('and(' + andExpr.replace(/^\(|\)$/g, '') + ')');
    out = out.filter(pred);
  }
  for (const [key, value] of params) {
    if (['select', 'order', 'limit', 'offset', 'columns', 'or', 'and', 'on_conflict'].includes(key)) continue;
    out = out.filter(parseExpr(key + '.' + value));
  }
  const order = params.get('order');
  if (order) {
    const [col, dir] = order.split('.');
    out.sort((a, b) => {
      const av = a[col], bv = b[col];
      const cmp = av === bv ? 0 : (av > bv ? 1 : -1);
      return dir === 'desc' ? -cmp : cmp;
    });
  }
  const limit = params.get('limit');
  if (limit) out = out.slice(0, Number(limit));
  return out;
}

function pick(row, select) {
  if (!select || select === '*') return { ...row };
  const cols = select.split(',').map((s) => s.trim()).filter(Boolean);
  const out = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  log(`${req.method} ${req.url}`);
  const hitKey = `${req.method} ${url.pathname}`;
  hits[hitKey] = (hits[hitKey] || 0) + 1;

  // Test-harness introspection: the E2E suite asserts against real backend
  // state instead of trusting the DOM alone.
  if (url.pathname === '/__admin/state') return json(res, 200, db);
  if (url.pathname === '/__admin/log') return json(res, 200, { log: fs.readFileSync(LOG_PATH, 'utf8') });
  if (url.pathname === '/__admin/metrics') return json(res, 200, { hits, delayMs: DELAY_MS });
  if (url.pathname === '/__admin/reset') {
    for (const k of Object.keys(hits)) delete hits[k];
    fs.writeFileSync(LOG_PATH, '');
    return json(res, 200, { reset: true });
  }
  if (url.pathname === '/__admin/reseed') {
    for (const name of Object.keys(SEED_DB)) db[name] = JSON.parse(JSON.stringify(SEED_DB[name]));
    Object.assign(seq, SEED_SEQ);
    for (const k of Object.keys(hits)) delete hits[k];
    return json(res, 200, { reseeded: true });
  }

  if (req.method === 'OPTIONS') {
    const requested = req.headers['access-control-request-headers'];
    res.writeHead(204, {
      ...cors,
      'Access-Control-Allow-Headers': requested || cors['Access-Control-Allow-Headers'],
      'Access-Control-Max-Age': '600',
      Vary: 'Access-Control-Request-Headers',
    });
    return res.end();
  }

  if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));

  const body = await readBody(req);
  const params = url.searchParams;
  const accept = String(req.headers.accept || '');
  const wantsObject = accept.includes('vnd.pgrst.object+json');
  const prefer = String(req.headers.prefer || '');

  // storage
  if (url.pathname.startsWith('/storage/v1/object/')) {
    if (req.method === 'POST' || req.method === 'PUT') {
      return json(res, 200, { Key: url.pathname.split('/').pop() });
    }
    if (req.method === 'DELETE') {
      return json(res, 200, []);
    }
    return json(res, 200, {});
  }
  if (url.pathname.startsWith('/storage/v1/bucket')) {
    return json(res, 200, { id: 'listing', public: true });
  }

  // rpc
  const rpc = url.pathname.match(/^\/rest\/v1\/rpc\/(.+)$/);
  if (rpc) {
    const name = rpc[1];
    const payload = body.length ? JSON.parse(body.toString()) : {};
    if (name === 'award_sow_for_listing') {
      const ad = table('listings').find((l) => l.id === Number(payload.p_ad_id));
      if (!ad) return json(res, 200, { success: false, awarded: false, error: 'listing_not_found' });
      const bal = table('sow_balances').find((b) => b.wallet_address.toLowerCase() === ad.seller_address.toLowerCase());
      if (bal) bal.balance += 1;
      else table('sow_balances').push({ wallet_address: ad.seller_address.toLowerCase(), balance: 1 });
      return json(res, 200, { success: true, awarded: true, balance: bal ? bal.balance : 1 });
    }
    if (name === 'delete_ad' || name === 'mark_ad_sold') {
      const ad = table('listings').find((l) => l.id === Number(payload.p_ad_id));
      if (!ad) return json(res, 200, { success: false, error: 'Ad not found' });
      if (String(ad.seller_address).toLowerCase() !== String(payload.p_wallet || '').toLowerCase()) {
        return json(res, 200, { success: false, error: 'Not your ad' });
      }
      ad.status = name === 'delete_ad' ? 'deleted' : 'sold';
      return json(res, 200, { success: true, message: 'ok' });
    }
    return json(res, 404, { code: 'PGRST202', message: 'function not found' });
  }

  const rest = url.pathname.match(/^\/rest\/v1\/([A-Za-z0-9_]+)$/);
  if (!rest) {
    if (url.pathname === '/rest/v1/' || url.pathname === '/rest/v1') return json(res, 200, { swagger: 'mock' });
    return json(res, 404, { message: 'not found' });
  }
  const name = rest[1];
  const rows = table(name);
  let selected = params.get('select');

  if (req.method === 'GET' || req.method === 'HEAD') {
    const filtered = applyQuery(rows, params);
    const countExact = String(req.headers.prefer || '').includes('count=exact') || url.searchParams.get('count') === 'exact';
    const head = req.method === 'HEAD';
    const extra = countExact ? { 'Content-Range': `0-0/${filtered.length}` } : {};
    if (head) {
      res.writeHead(200, { ...cors, ...extra });
      return res.end();
    }
    if (wantsObject) {
      const row = filtered[0];
      if (!row) return json(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' });
      return json(res, 200, pick(row, selected));
    }
    return json(res, 200, filtered.map((r) => pick(r, selected)));
  }

  if (req.method === 'POST') {
    const payload = body.length ? JSON.parse(body.toString()) : {};
    const items = Array.isArray(payload) ? payload : [payload];
    const inserted = [];
    for (const item of items) {
      const existing = item.wallet_address
        ? rows.find((r) => String(r.wallet_address).toLowerCase() === String(item.wallet_address).toLowerCase())
        : null;
      if (existing && prefer.includes('merge-duplicates')) {
        Object.assign(existing, item);
        inserted.push(existing);
        continue;
      }
      const row = { id: seq[name] ? seq[name]++ : rows.length + 1, ...item, created_at: new Date().toISOString() };
      rows.push(row);
      inserted.push(row);
    }
    if (prefer.includes('return=representation')) {
      const out = inserted.map((r) => pick(r, selected || '*'));
      return json(res, 201, wantsObject ? out[0] : out);
    }
    res.writeHead(201, cors);
    return res.end();
  }

  if (req.method === 'PATCH') {
    const filtered = applyQuery(rows, params);
    const patch = body.length ? JSON.parse(body.toString()) : {};
    filtered.forEach((r) => Object.assign(r, patch));
    if (prefer.includes('return=representation')) return json(res, 200, filtered.map((r) => pick(r, selected || '*')));
    res.writeHead(204, cors);
    return res.end();
  }

  if (req.method === 'DELETE') {
    const filtered = applyQuery(rows, params);
    const ids = new Set(filtered.map((r) => r.id));
    db[name] = rows.filter((r) => !ids.has(r.id));
    res.writeHead(204, cors);
    return res.end();
  }

  return json(res, 405, { message: 'method not allowed' });
});

fs.writeFileSync(LOG_PATH, '');
server.listen(PORT, '127.0.0.1', () => log(`mock backend on ${PORT}`));
