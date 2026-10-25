// Serves a throwaway test build of the app plus the E2E harness:
//  - app.test.js   = app.js with SUPABASE_URL pointed at the mock backend and
//                    MiniKit commands routed through window.__E2E_* mocks
//  - index.test.html = index.html without the CSP meta (the mock lives on http://)
//                    and with the harness script injected before app.js
// Everything else is served straight from the real project directory.
//
// Run: node tools/e2e/test-server.cjs   (mock backend must be on :3457)
// Open: http://127.0.0.1:3456/?e2e=1     (results land in tools/e2e/e2e-result.json)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'build');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

fs.mkdirSync(OUT, { recursive: true });

const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
let testApp = appSrc;
const applied = [];
function patch(name, from, to, { all = false } = {}) {
  if (!testApp.includes(from)) throw new Error(`harness patch "${name}" did not match app.js`);
  testApp = all ? testApp.split(from).join(to) : testApp.replace(from, to);
  applied.push(name);
}

patch('api-url', "const SUPABASE_URL = 'https://adicdkrfinbudpaqqjai.supabase.co';", "const SUPABASE_URL = 'http://127.0.0.1:3457';");
// Boot: never wait for a World App that is not there.
patch('boot-ready', 'const ready = await waitForMiniKitReady();\n  if (!ready) { checkWorldAppEnvironment(); return; }', 'const ready = true;');
// Outside World App the blocker screen would hide the whole app.
patch('env-gate', 'if (!isMiniKitInstalled()) {', 'if (false && !isMiniKitInstalled()) {');
// The silent refresh never answers outside World App.
patch('silent-auth', "if (savedAddress && typeof MiniKit !== 'undefined') {", 'if (false) {');
// MiniKit commands are mocked from the page so success/failure paths are testable.
patch('mock-pay', 'MiniKit.commandsAsync.pay({', '(window.__E2E_PAY || MiniKit.commandsAsync.pay)({');
patch('mock-auth', 'MiniKit.commandsAsync.walletAuth({', '(window.__E2E_AUTH || MiniKit.commandsAsync.walletAuth)({', { all: true });
patch('mock-verify', 'mk.commandsAsync.verify({', '(window.__E2E_VERIFY || mk.commandsAsync.verify)({');
patch('mock-permission', 'mk.commandsAsync.requestPermission({ permission })', '(window.__E2E_PERMISSION || (function (p) { return mk.commandsAsync.requestPermission(p); }))({ permission })');
// Short command timeouts keep the hang-detection paths inside a test run.
patch('timeout-pay', "}), 120000, 'pay')", "}), 3000, 'pay')");
patch('timeout-walletauth', "}), 60000, 'walletAuth')", "}), 3000, 'walletAuth')");
patch('timeout-verify', "}), 60000, 'verify')", "}), 3000, 'verify')");
patch('timeout-silent', "}), 15000, 'silent walletAuth')", "}), 2000, 'silent walletAuth')");
// Cooldowns are tested separately; in the suite they would only add dead time.
patch('rate-post', "checkRateLimit('postAd', 10000)", "checkRateLimit('postAd', 400)");
patch('rate-review', "checkRateLimit('review', 5000)", "checkRateLimit('review', 400)");
patch('rate-delete', "checkRateLimit('deleteAd', 3000)", "checkRateLimit('deleteAd', 400)");
patch('rate-sold', "checkRateLimit('soldOut', 3000)", "checkRateLimit('soldOut', 400)");
patch('rate-chat', "checkRateLimit('chat', 1000)", "checkRateLimit('chat', 200)");
patch('rate-login', "checkRateLimit('login', 5000)", "checkRateLimit('login', 300)");

fs.writeFileSync(path.join(OUT, 'app.test.js'), testApp);

const indexSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let testHtml = indexSrc.replace(/ {0,4}<meta http-equiv="Content-Security-Policy"[^>]*>\r?\n?/, '');
if (testHtml === indexSrc) throw new Error('CSP meta not found in index.html');
testHtml = testHtml.replace('src="app.js"', 'src="/__app.test.js"');
if (!testHtml.includes('/__app.test.js')) throw new Error('app script tag not found in index.html');
testHtml = testHtml.replace('<script type="module" src="/__app.test.js"></script>', '<script src="/__probe.js"></script>\n  <script src="/__e2e.js"></script>\n  <script type="module" src="/__app.test.js"></script>');
if (!testHtml.includes('/__e2e.js')) throw new Error('harness script injection failed');
if (!testHtml.includes('/__probe.js')) throw new Error('probe script injection failed');
fs.writeFileSync(path.join(OUT, 'index.test.html'), testHtml);

fs.writeFileSync(path.join(__dirname, 'build.out'), 'patches applied: ' + applied.join(', ') + '\nindex bytes: ' + Buffer.byteLength(testHtml) + '\n');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'POST' && url === '/__e2e/result') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      fs.writeFileSync(path.join(__dirname, 'e2e-result.json'), body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"saved":true}');
    });
    return;
  }

  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync(path.join(OUT, 'index.test.html')));
  }
  if (url === '/__app.test.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(fs.readFileSync(path.join(OUT, 'app.test.js')));
  }
  if (url === '/__e2e.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(fs.readFileSync(path.join(__dirname, 'e2e.js')));
  }
  if (url === '/__probe.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(fs.readFileSync(path.join(__dirname, 'probe.js')));
  }

  const fp = path.join(ROOT, decodeURIComponent(url));
  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(3456, '127.0.0.1');
