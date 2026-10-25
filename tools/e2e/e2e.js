/* WantSell E2E harness (test-only, served by tools/e2e/test-server.cjs).
 *
 * Runs against the real index.html/app.js with SUPABASE_URL pointed at the mock
 * PostgREST backend. MiniKit commands are routed through window.__E2E_* mocks
 * (see test-server.cjs) so payment, World ID and timeout paths are testable.
 *
 * Open http://127.0.0.1:3456/?e2e=1 and the suite runs itself; results are
 * POSTed to /__e2e/result -> tools/e2e/e2e-result.json and kept on
 * window.__E2E__ for inspection.
 */
(function () {
  'use strict';

  var USER = '0x8c5b20653abcb87f6b3a7cb469d8623e94bfb6a1';
  var SELLER = '0xaaa1111111111111111111111111111111111111';
  var BUYER = '0xbbb2222222222222222222222222222222222222';
  var API = 'http://127.0.0.1:3457';

  var pageErrors = [];
  var consoleErrors = [];
  window.addEventListener('error', function (e) { pageErrors.push('error: ' + (e.message || e.type)); });
  window.addEventListener('unhandledrejection', function (e) {
    pageErrors.push('rejection: ' + ((e.reason && e.reason.message) || e.reason));
  });
  var realConsoleError = console.error.bind(console);
  console.error = function () {
    consoleErrors.push(Array.prototype.map.call(arguments, function (a) { return (a && a.message) || String(a); }).join(' '));
    realConsoleError.apply(null, arguments);
  };

  // The app boots from localStorage, so seed a signed-in (admin) wallet and a
  // saved location before app.js runs. This script is a classic script placed
  // before the module tag, so it executes first.
  try {
    localStorage.setItem('userWallet', USER);
    localStorage.setItem('currentUsername', 'airdrophuman');
    localStorage.setItem('lang', 'en');
    localStorage.setItem('wantsell_geo_v1', JSON.stringify({ lat: 19.0596, lng: 72.8295, label: 'Mumbai', ts: Date.now() }));
    localStorage.removeItem('worldIdVerified');
  } catch (e) {}

  var $ = function (sel) { return document.querySelector(sel); };

  // The preview tab is often hidden, and Chromium clamps setTimeout in hidden
  // tabs to ~1s (or worse). MessageChannel tasks are not clamped, so every wait
  // in this suite is driven by it instead of by timers.
  var tickQueue = [];
  var tickChan = new MessageChannel();
  tickChan.port1.onmessage = function () {
    var q = tickQueue;
    tickQueue = [];
    for (var i = 0; i < q.length; i++) q[i]();
  };
  var tick = function () {
    return new Promise(function (r) { tickQueue.push(r); tickChan.port2.postMessage(0); });
  };
  var sleep = async function (ms) {
    var t0 = performance.now();
    while (performance.now() - t0 < ms) await tick();
  };
  var txt = function (el) { return el ? String(el.textContent || '') : ''; };
  var vis = function (el) { return !!el && el.style.display !== 'none' && getComputedStyle(el).display !== 'none'; };
  var cards = function () { return Array.prototype.slice.call(document.querySelectorAll('#listingsContainer .listing-card')); };
  var cardTitles = function () { return Array.prototype.map.call(document.querySelectorAll('#listingsContainer .card-title'), txt); };

  function assert(cond, msg) { if (!cond) throw new Error(msg); }

  async function until(fn, label, timeout) {
    timeout = timeout || 9000;
    var start = performance.now();
    for (;;) {
      var v = false;
      try { v = fn(); } catch (e) { v = false; }
      if (v) return v;
      if (performance.now() - start > timeout) throw new Error('timed out waiting for ' + label);
      await tick();
    }
  }

  function popupOpen() { return vis($('#neonPopup')); }

  function answerPopup(answer) {
    var clicked = false;
    if (answer === 'yes') { $('#neonPopupConfirmYesBtn').click(); clicked = true; }
    else if (answer === 'no') { $('#neonPopupConfirmNoBtn').click(); clicked = true; }
    else if (answer === 'ok') { $('#neonPopupAlertBtn').click(); clicked = true; }
    if (!clicked) throw new Error('unknown popup answer: ' + answer);
  }

  // For actions that return a promise and show one or more popups (confirm,
  // then a result). `answers` is a single answer or a list of them.
  async function act(action, answers) {
    answers = Array.isArray(answers) ? answers.slice() : [answers];
    var done = false;
    var err = null;
    var p = Promise.resolve().then(action).then(function () { done = true; }, function (e) { done = true; err = e; });
    var seen = [];
    for (;;) {
      var start = performance.now();
      while (!popupOpen() && !done && performance.now() - start < 10000) await tick();
      if (popupOpen()) {
        seen.push({ title: txt($('#neonPopupTitle')), text: txt($('#neonPopupText')) });
        answerPopup(answers.length ? answers.shift() : 'ok');
        await sleep(120);
        continue;
      }
      if (done) break;
      throw new Error('action neither finished nor showed a popup');
    }
    await p;
    await sleep(80);
    if (err) throw err;
    var first = seen[0] || { title: '', text: '' };
    return { title: first.title, text: first.text, all: seen };
  }

  // For fire-and-forget handlers (form submit) that show a popup later.
  async function nextPopup(answer, timeout) {
    await until(popupOpen, 'popup', timeout);
    var title = txt($('#neonPopupTitle'));
    var text = txt($('#neonPopupText'));
    answerPopup(answer);
    await until(function () { return !popupOpen(); }, 'popup closed');
    return { title: title, text: text };
  }

  async function state() {
    var res = await fetch(API + '/__admin/state');
    return res.json();
  }

  async function mockLog() {
    var res = await fetch(API + '/__admin/log');
    return (await res.json()).log || '';
  }

  async function metrics() {
    var res = await fetch(API + '/__admin/metrics');
    return (await res.json()).hits || {};
  }

  function closeModals() {
    ['#chatModal', '#reviewsModal', '#adDetailsModal', '#legalModal', '#leaderboardModal', '#adminModal', '#imageViewerModal', '#neonPopup'].forEach(function (sel) {
      var el = $(sel);
      if (el) el.style.display = 'none';
    });
  }

  async function makePngFile(name) {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff6b2c';
    ctx.fillRect(0, 0, 16, 16);
    var blob = await new Promise(function (res) { canvas.toBlob(res, 'image/png'); });
    return new File([blob], name, { type: 'image/png' });
  }

  function setFiles(files) {
    var dt = new DataTransfer();
    files.forEach(function (f) { dt.items.add(f); });
    var input = $('#imageInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function submitAdForm() {
    var form = $('#adForm');
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }

  function fillAdForm(overrides) {
    var v = Object.assign({
      title: 'E2E desk lamp',
      description: 'A clean desk lamp, works perfectly and comes with the box.',
      price: '12.50',
      address: 'Powai, Mumbai',
      category: 'Home Appliances',
      country: 'IN',
      condition: 'used',
      priceType: 'fixed',
    }, overrides || {});
    $('#title').value = v.title;
    $('#description').value = v.description;
    $('#price').value = v.price;
    $('#adAddress').value = v.address;
    $('#category').value = v.category;
    $('#adCountry').value = v.country;
    $('#adCondition').value = v.condition;
    $('#priceType').value = v.priceType;
  }

  var S = {};

  var suite = [
    ['boot: app starts outside World App without a blocker', async function () {
      await until(function () { return window.__appBooted === true; }, 'app boot', 12000);
      await until(function () { return vis($('#appShell')); }, 'app shell visible', 8000);
      assert($('#worldAppBlocker') ? !vis($('#worldAppBlocker')) : true, 'World App blocker must not cover the app');
      await until(function () { return !vis($('#splashScreen')); }, 'splash hidden', 8000);
      assert(!popupOpen(), 'no popup on first paint');
      assert(/airdrophuman/.test(txt($('#loginBtn'))), 'header username, got "' + txt($('#loginBtn')) + '"');
    }],

    ['feed: renders active listings with live usernames', async function () {
      await until(function () { return cards().length === 3; }, '3 feed cards');
      var titles = cardTitles();
      assert(titles.length === 3, 'expected 3 cards, got ' + titles.length);
      assert(titles.indexOf('Deleted ad') === -1, 'deleted listing must not appear');
      assert(titles.indexOf('iPhone 15 Pro Max') !== -1, 'iPhone card missing');
      var sellers = Array.prototype.map.call(document.querySelectorAll('#listingsContainer .card-seller > span:last-child'), txt);
      assert(sellers.indexOf('seller_one') !== -1, 'users-table name not used: ' + sellers.join(','));
      assert(txt($('#feedCount')) === '3', 'feed count badge, got "' + txt($('#feedCount')) + '"');
      assert(txt($('#homeSowCount')) === '7', 'home SOW balance, got "' + txt($('#homeSowCount')) + '"');
    }],

    ['feed: search and category filters', async function () {
      $('#searchInput').value = 'iphone';
      await window.fetchListings();
      await until(function () { return cards().length === 1; }, 'search narrows to 1');
      assert(cardTitles()[0] === 'iPhone 15 Pro Max', 'wrong search hit: ' + cardTitles()[0]);
      window.clearSearch();
      await until(function () { return cards().length === 3; }, 'search cleared');
      $('#categoryFilter').value = 'Home Appliances';
      await window.fetchListings();
      await until(function () { return cards().length === 1; }, 'category filter');
      assert(cardTitles()[0] === 'Wooden study table', 'wrong category hit: ' + cardTitles()[0]);
      $('#categoryFilter').value = 'ALL';
      await window.fetchListings();
      await until(function () { return cards().length === 3; }, 'category reset');
    }],

    ['ad details: full data, photo and seller', async function () {
      await window.openAdDetails(1);
      await until(function () { return vis($('#adDetailsModal')); }, 'details modal');
      var body = txt($('#adDetailsBody'));
      assert(body.indexOf('iPhone 15 Pro Max') !== -1, 'title missing from details');
      assert(body.indexOf('620.00') !== -1, 'price missing from details');
      assert(body.indexOf('seller_one') !== -1, 'seller missing from details');
      assert($('#adDetailsBody').querySelectorAll('.detail-img').length === 1, 'photo not rendered');
      closeModals();
    }],

    ['ad details: deleted and unknown ads are refused', async function () {
      var gone = await act(function () { return window.openAdDetails(5); }, 'ok');
      assert(/removed/i.test(gone.text), 'deleted ad message, got "' + gone.text + '"');
      var missing = await act(function () { return window.openAdDetails(987654); }, 'ok');
      assert(/not found|removed/i.test(missing.text), 'unknown ad message, got "' + missing.text + '"');
      closeModals();
    }],

    ['chat: only the pair conversation is shown', async function () {
      await window.openChat(SELLER, 'iPhone 15 Pro Max', 'seller_one');
      await until(function () { return $('#chatMessages').querySelectorAll('.chat-msg').length >= 3; }, 'chat messages');
      var body = txt($('#chatMessages'));
      assert(body.indexOf('is this still available') !== -1, 'own message missing');
      assert(body.indexOf('Yes it is') !== -1, 'seller reply missing');
      assert(body.indexOf('Different conversation') === -1, 'another pair leaked into the chat');
      assert(/seller_one/.test(txt($('#chatTitle'))), 'chat title, got "' + txt($('#chatTitle')) + '"');
    }],

    ['chat: sending a message persists it', async function () {
      $('#chatInput').value = 'E2E: is it still available?';
      await window.sendMessage();
      await until(function () { return txt($('#chatMessages')).indexOf('E2E: is it still available?') !== -1; }, 'sent bubble');
      var st = await state();
      assert(st.chats.some(function (c) { return c.message === 'E2E: is it still available?'; }), 'message not stored in backend');
      closeModals();
    }],

    ['chat: self-chat is blocked', async function () {
      var r = await act(function () { return window.openChat(USER, 'iPhone 15 Pro Max', 'me'); }, 'ok');
      assert(/yourself/i.test(r.text), 'self chat message, got "' + r.text + '"');
      closeModals();
    }],

    ['reviews: list loads for the seller', async function () {
      await window.openReviews(SELLER, 'seller_one');
      await until(function () { return $('#reviewsListContainer').querySelectorAll('.review-item').length === 2; }, '2 reviews');
      assert(/seller_one/.test(txt($('#reviewsModalTitle'))), 'reviews title');
      closeModals();
    }],

    ['reviews: self and duplicate reviews are blocked', async function () {
      await sleep(450);
      window.targetSellerAddress = USER;
      $('#reviewRating').value = '5';
      $('#reviewComment').value = 'should never be stored';
      var self = await act(function () { return window.submitReview(); }, 'ok');
      assert(/yourself/i.test(self.text), 'self review message, got "' + self.text + '"');
      await sleep(450);
      window.targetSellerAddress = SELLER;
      $('#reviewRating').value = '5';
      $('#reviewComment').value = 'duplicate attempt';
      var dup = await act(function () { return window.submitReview(); }, 'ok');
      assert(/already reviewed/i.test(dup.title + ' ' + dup.text), 'duplicate review message, got "' + dup.title + '"');
      var st = await state();
      assert(!st.reviews.some(function (r) { return r.comment === 'should never be stored' || r.comment === 'duplicate attempt'; }), 'blocked review reached the backend');
      closeModals();
    }],

    ['reviews: a new review is stored and shown', async function () {
      await sleep(450);
      window.targetSellerAddress = BUYER;
      $('#reviewRating').value = '5';
      $('#reviewComment').value = 'Fast deal, thank you';
      var r = await act(function () { return window.submitReview(); }, 'ok');
      assert(/success/i.test(r.title), 'review submit title, got "' + r.title + '"');
      await until(function () { return $('#reviewsListContainer').querySelectorAll('.review-item').length === 1; }, 'review re-rendered');
      var st = await state();
      assert(st.reviews.some(function (x) { return x.seller_address === BUYER && x.buyer_address === USER && x.rating === 5; }), 'review not stored');
      closeModals();
    }],

    ['my ads: active/sold split and balance', async function () {
      window.switchTab('screenMyAds');
      await window.openMyAdsScreen();
      await until(function () { return txt($('#myAdsContainer')).indexOf('Active (1)') !== -1; }, 'active section');
      var body = txt($('#myAdsContainer'));
      assert(body.indexOf('Sold (1)') !== -1, 'sold section missing');
      assert(body.indexOf('My old bicycle') !== -1, 'own active ad missing');
      assert(body.indexOf('Sold desk lamp') !== -1, 'sold ad missing');
      assert(body.indexOf('Deleted ad') === -1, 'deleted ad listed');
      assert(txt($('#myAdsBalanceCard')).indexOf('7') !== -1, 'balance card, got "' + txt($('#myAdsBalanceCard')) + '"');
    }],

    ['my ads: cancelling a delete keeps the ad', async function () {
      var r = await act(function () { return window.deleteMyAd(3); }, 'no');
      assert(/delete ad/i.test(r.title), 'delete confirm title, got "' + r.title + '"');
      var st = await state();
      assert(st.listings.find(function (l) { return l.id === 3; }).status === 'active', 'cancel must keep the ad active');
    }],

    ['my ads: already-sold guard', async function () {
      await sleep(450);
      var r = await act(function () { return window.markAsSoldOut(4); }, ['yes', 'ok']);
      assert(/mark as sold/i.test(r.title), 'confirm title, got "' + r.title + '"');
      assert(r.all[1] && /already sold/i.test(r.all[1].title), 'already-sold popup, got "' + (r.all[1] && r.all[1].title) + '"');
    }],

    ['my ads: mark as sold', async function () {
      await sleep(450);
      var r = await act(function () { return window.markAsSoldOut(3); }, ['yes', 'ok']);
      assert(r.all[1] && /sold/i.test(r.all[1].title), 'mark sold popup, got "' + (r.all[1] && r.all[1].title) + '"');
      var st = await state();
      assert(st.listings.find(function (l) { return l.id === 3; }).status === 'sold', 'status not sold in backend');
    }],

    ['my ads: delete keeps the SOW balance', async function () {
      await sleep(450);
      var r = await act(function () { return window.deleteMyAd(3); }, ['yes', 'ok']);
      assert(r.all[1] && /deleted/i.test(r.all[1].title), 'delete popup, got "' + (r.all[1] && r.all[1].title) + '"');
      var st = await state();
      assert(st.listings.find(function (l) { return l.id === 3; }).status === 'deleted', 'status not deleted in backend');
      var bal = st.sow_balances.find(function (b) { return b.wallet_address.toLowerCase() === USER; });
      assert(bal && bal.balance === 7, 'SOW balance changed by delete: ' + (bal && bal.balance));
      await until(function () { return cards().length === 2; }, 'feed refreshed after delete');
    }],

    ['post: validation messages', async function () {
      window.switchTab('screenPost');
      await sleep(450);
      fillAdForm({ title: '', description: '' });
      submitAdForm();
      var r1 = await nextPopup('ok');
      assert(r1.title === 'Invalid Title', 'empty title popup, got "' + r1.title + '"');

      await sleep(450);
      fillAdForm({ description: '' });
      submitAdForm();
      var r2 = await nextPopup('ok');
      assert(r2.title === 'Invalid Description', 'short description popup, got "' + r2.title + '"');

      await sleep(450);
      fillAdForm({ description: 'Call me on 9876543210 for details of this lamp.' });
      submitAdForm();
      var r3 = await nextPopup('ok');
      assert(/phone/i.test(r3.text), 'phone-number guard, got "' + r3.text + '"');

      await sleep(450);
      fillAdForm({ description: 'See https://example.com/lamp for more photos of it.' });
      submitAdForm();
      var r4 = await nextPopup('ok');
      assert(/external links/i.test(r4.text), 'external link guard, got "' + r4.text + '"');

      await sleep(450);
      fillAdForm();
      setFiles([]);
      submitAdForm();
      var r5 = await nextPopup('ok');
      assert(r5.title === 'Image Missing', 'missing image popup, got "' + r5.title + '"');
    }],

    ['post: fee is disclosed before anything uploads', async function () {
      await sleep(450);
      fillAdForm();
      setFiles([await makePngFile('lamp.png')]);
      await until(function () { return $('#photoGrid').querySelectorAll('.photo-preview, img').length >= 1; }, 'photo preview');
      var before = (await mockLog()).split('\n').filter(function (l) { return l.indexOf('/storage/v1/object') !== -1; }).length;
      submitAdForm();
      var r = await nextPopup('no');
      assert(r.title === 'Confirm 1 WLD payment', 'disclosure title, got "' + r.title + '"');
      assert(/1 WLD/.test(r.text) && /not refundable/i.test(r.text), 'disclosure text, got "' + r.text + '"');
      await sleep(300);
      var after = (await mockLog()).split('\n').filter(function (l) { return l.indexOf('/storage/v1/object') !== -1; }).length;
      assert(after === before, 'cancelling still uploaded ' + (after - before) + ' photo(s)');
      var st = await state();
      assert(!st.listings.some(function (l) { return l.title === 'E2E desk lamp'; }), 'cancelled post created a listing');
      assert($('#postAdSubmit').disabled === false, 'submit button left disabled after cancel');
    }],

    ['post: a pay command that never answers cannot hang the button', async function () {
      await sleep(450);
      window.__E2E_PAY = function () { return new Promise(function () {}); };
      fillAdForm();
      setFiles([await makePngFile('lamp2.png')]);
      submitAdForm();
      await nextPopup('yes');
      var r = await nextPopup('ok', 12000);
      assert(/payment cancelled/i.test(r.title), 'timeout popup title, got "' + r.title + '"');
      assert(/timed out/i.test(r.text), 'timeout detail, got "' + r.text + '"');
      assert($('#postAdSubmit').disabled === false, 'submit button stayed disabled after a pay timeout');
      var st = await state();
      assert(!st.listings.some(function (l) { return l.title === 'E2E desk lamp'; }), 'timed-out payment created a listing');
    }],

    ['post: successful payment publishes and credits SOW', async function () {
      await sleep(450);
      window.__E2E_PAY = function (payload) {
        window.__E2E_PAY_PAYLOAD = payload;
        return Promise.resolve({ finalPayload: { status: 'success' } });
      };
      fillAdForm();
      setFiles([await makePngFile('lamp3.png')]);
      submitAdForm();
      await nextPopup('yes');
      var r = await nextPopup('ok', 15000);
      assert(r.title === 'Ad Posted', 'posted popup, got "' + r.title + '"');
      assert(/SOW/.test(r.text), 'SOW notice missing: "' + r.text + '"');
      var st = await state();
      var created = st.listings.filter(function (l) { return l.title === 'E2E desk lamp'; });
      assert(created.length === 1, 'expected 1 stored listing, got ' + created.length);
      assert(created[0].seller_address === USER, 'listing stored with wrong seller');
      assert(created[0].image1 && /^http/.test(created[0].image1), 'uploaded photo url missing');
      var bal = st.sow_balances.find(function (b) { return b.wallet_address.toLowerCase() === USER; });
      assert(bal && bal.balance === 8, 'SOW should be 8 after posting, got ' + (bal && bal.balance));
      await until(function () { return cardTitles().indexOf('E2E desk lamp') !== -1; }, 'new ad in feed');
      await until(function () { return txt($('#homeSowCount')) === '8'; }, 'SOW badge 8, got "' + txt($('#homeSowCount')) + '"');
    }],

    ['profile: identity, balance and legal rows', async function () {
      window.switchTab('screenProfile');
      await until(function () { return txt($('#profileContainer')).indexOf('airdrophuman') !== -1; }, 'profile name');
      var p = txt($('#profileContainer'));
      assert(p.indexOf('0x8c5b...b6a1') !== -1, 'short wallet missing');
      assert(p.indexOf('8') !== -1, 'profile balance missing');
      assert(p.indexOf('v1.3.1') !== -1, 'version missing');
      assert(p.indexOf('Delete my data') !== -1, 'delete-data row missing');
    }],

    ['leaderboard: ranked with resolved names', async function () {
      await window.openLeaderboard();
      await until(function () { return document.querySelectorAll('.lb-item').length >= 3; }, 'leaderboard rows');
      var rows = Array.prototype.slice.call(document.querySelectorAll('.lb-item'));
      assert(txt(rows[0].querySelector('.lb-rank')) === '1st', 'first rank label, got "' + txt(rows[0].querySelector('.lb-rank')) + '"');
      assert(txt(rows[0].querySelector('.lb-name')) === 'airdrophuman', 'first name, got "' + txt(rows[0].querySelector('.lb-name')) + '"');
      assert(txt(rows[0].querySelector('.lb-balance')) === '8', 'first balance, got "' + txt(rows[0].querySelector('.lb-balance')) + '"');
      assert(txt(rows[1].querySelector('.lb-balance')) === '3', 'second balance, got "' + txt(rows[1].querySelector('.lb-balance')) + '"');
      closeModals();
    }],

    ['legal: terms and privacy open', async function () {
      window.openLegal('terms');
      await until(function () { return vis($('#legalModal')); }, 'terms modal');
      assert(txt($('#legalBody')).length > 200, 'terms content too short');
      assert(/terms/i.test(txt($('#legalModalTitle'))), 'terms title');
      window.openLegal('privacy');
      await until(function () { return /privacy/i.test(txt($('#legalModalTitle'))); }, 'privacy title');
      assert(txt($('#legalBody')).length > 200, 'privacy content too short');
      closeModals();
    }],

    ['profile: delete-my-data cancel touches nothing', async function () {
      var before = await state();
      var r = await act(function () { return window.requestDataDeletion(); }, 'no');
      assert(/delete my data/i.test(r.title), 'delete-data title, got "' + r.title + '"');
      var after = await state();
      assert(JSON.stringify(before) === JSON.stringify(after), 'cancelling the deletion request still changed backend data');
    }],

    ['offline banner follows connectivity', async function () {
      window.dispatchEvent(new Event('offline'));
      await until(function () { var b = document.getElementById('offlineBanner'); return b && b.style.display === 'block'; }, 'offline banner');
      window.dispatchEvent(new Event('online'));
      await until(function () { var b = document.getElementById('offlineBanner'); return b && b.style.display === 'none'; }, 'online hides banner');
    }],

    ['feed: server failure shows an honest error and Retry recovers', async function () {
      var realFetch = window.fetch;
      try {
        window.fetch = function () { return Promise.reject(new TypeError('Failed to fetch')); };
        await window.fetchListings({ force: true });
        var body = txt($('#listingsContainer'));
        assert(/server unavailable/i.test(body), 'error title, got "' + body.slice(0, 120) + '"');
        assert(/UNREACHABLE/.test(body), 'error code missing');
        var retry = Array.prototype.slice.call($('#listingsContainer').querySelectorAll('button')).filter(function (b) { return /try again/i.test(txt(b)); })[0];
        assert(!!retry, 'retry button missing');
        window.fetch = realFetch;
        $('#searchInput').value = '';
        $('#categoryFilter').value = 'ALL';
        retry.click();
        await until(function () { return cards().length >= 3; }, 'retry recovers the feed');
      } finally {
        // A failed assertion must not leave the page without a working fetch, or
        // every later test fails for the wrong reason.
        window.fetch = realFetch;
      }
    }],

    ['admin: panel loads stats and listings', async function () {
      await window.openAdminPanel();
      await until(function () { return document.querySelectorAll('#adminStatsContainer .admin-stat-number').length === 3; }, 'admin stats');
      await until(function () { return document.querySelectorAll('#adminListingsContainer .my-ad-item').length > 0; }, 'admin listings');
      assert(document.querySelectorAll('#adminListingsContainer .btn-force-delete').length > 0, 'admin force-delete buttons missing');
      var stats = Array.prototype.map.call(document.querySelectorAll('#adminStatsContainer .admin-stat-number'), txt);
      assert(stats.join('').length > 0, 'admin stats empty');
      closeModals();
    }],

    ['world id: verify that never answers fails loudly, success shows the badge', async function () {
      // Start from an unverified profile even if an earlier run stored a proof.
      localStorage.removeItem('worldIdVerified');
      localStorage.removeItem('worldIdVerification');
      window.__E2E_VERIFY = function () { return new Promise(function () {}); };
      var bad = await act(function () { return window.verifyWorldID(); }, 'ok');
      assert(/verification failed/i.test(bad.title), 'verify timeout title, got "' + bad.title + '"');
      var seen = null;
      window.__E2E_VERIFY = function (payload) {
        seen = payload;
        return Promise.resolve({ finalPayload: { status: 'success', verification_level: 'orb', nullifier_hash: '0xnullifier' } });
      };
      var ok = await window.verifyWorldID();
      assert(seen && seen.action === 'post_ad', 'verify action must be post_ad, got ' + JSON.stringify(seen));
      assert(seen.signal === USER, 'verify signal must be the wallet, got ' + seen.signal);
      var stored = JSON.parse(localStorage.getItem('worldIdVerification') || 'null');
      assert(stored && stored.nullifier_hash === '0xnullifier', 'verification proof was not stored');
      assert(stored.verification_level === 'orb', 'verification level was not stored');
      assert(ok === true, 'verify success should return true');
      window.switchTab('screenProfile');
      await until(function () { return $('#profileContainer').querySelector('.verify-badge'); }, 'verified badge');
    }],

    ['minikit: notification permission uses the requestPermission command', async function () {
      // 1.9.6 has no commandsAsync.requestNotificationPermissions; the old call
      // was a silent no-op, so this asserts the documented payload is sent.
      var seen = null;
      window.__E2E_PERMISSION = function (payload) { seen = payload; return Promise.resolve({ finalPayload: { status: 'success' } }); };
      await window.requestNotificationPermissions();
      assert(seen, 'requestPermission was never called');
      assert(seen.permission === 'notifications', 'permission payload, got ' + JSON.stringify(seen));
      window.__E2E_PERMISSION = null;
    }],

    ['minikit: pay is called with the documented SDK payload', async function () {
      var p = window.__E2E_PAY_PAYLOAD;
      assert(p, 'pay payload was not captured');
      assert(typeof p.reference === 'string' && p.reference.length >= 8, 'reference must be a non-empty string');
      assert(/^0x[a-fA-F0-9]{40}$/.test(p.to), 'to must be a wallet address, got ' + p.to);
      assert(Array.isArray(p.tokens) && p.tokens.length === 1, 'tokens must hold exactly one entry');
      assert(p.tokens[0].symbol === 'WLD', 'token symbol, got ' + p.tokens[0].symbol);
      assert(p.tokens[0].token_amount === '1000000000000000000', 'amount must be 1 WLD in base units, got ' + p.tokens[0].token_amount);
      assert(/listing fee/i.test(p.description || ''), 'description must disclose the fee, got ' + p.description);
    }],

    ['feed: card photos use a resized storage URL', async function () {
      var out = window.cardImageUrl('https://x.supabase.co/storage/v1/object/public/listing/a.jpg', 480);
      assert(out.indexOf('/storage/v1/render/image/public/') !== -1, 'storage transform missing: ' + out);
      assert(/width=480/.test(out) && /resize=cover/.test(out), 'resize params missing: ' + out);
      var plain = window.cardImageUrl('https://images.example.com/a.jpg', 480);
      assert(plain === 'https://images.example.com/a.jpg', 'non-storage urls must be untouched');
    }],

    ['feed: a warm cache paints before the network and skips the query', async function () {
      await window.fetchListings({ force: true });
      var before = await metrics();
      var container = $('#listingsContainer');
      container.innerHTML = '';
      var pending = window.fetchListings();
      assert(cards().length >= 3, 'cached cards must paint synchronously, got ' + cards().length);
      var img = $('#listingsContainer .card-thumb');
      assert(img && img.getAttribute('loading') === 'lazy', 'card images must load lazily');
      await pending;
      var after = await metrics();
      var delta = (after['GET /rest/v1/listings'] || 0) - (before['GET /rest/v1/listings'] || 0);
      assert(delta === 0, 'a fresh cache must not re-query listings, '+ delta + ' extra query');
    }],

    ['no uncaught errors during the run', async function () {
      assert(pageErrors.length === 0, 'page errors: ' + pageErrors.join(' | '));
    }],
  ];

  async function run() {
    var t0 = Date.now();
    var results = [];
    // Every run starts from the seed data, so a second run in the same browser
    // does not inherit the previous run's listings, reviews or SOW balance.
    try { await fetch(API + '/__admin/reseed'); } catch (e) {}
    // The cached feed belongs to the previous run's data, not the fresh seed.
    try { sessionStorage.removeItem('ws_feed_v1'); } catch (e) {}
    try { await window.updateSowBadge(); } catch (e) {}
    try { await window.fetchListings({ force: true }); } catch (e) {}
    for (var i = 0; i < suite.length; i++) {
      var name = suite[i][0];
      var fn = suite[i][1];
      try {
        await fn();
        results.push({ name: name, ok: true });
      } catch (e) {
        results.push({ name: name, ok: false, error: (e && e.message) || String(e) });
        try { closeModals(); } catch (e2) {}
      }
      var el = document.getElementById('e2eProgress');
      if (el) el.textContent = (i + 1) + '/' + suite.length + ' ' + name;
    }
    var pass = results.filter(function (r) { return r.ok; }).length;
    var report = {
      pass: pass,
      fail: results.length - pass,
      durationMs: Date.now() - t0,
      results: results,
      pageErrors: pageErrors,
      consoleErrors: consoleErrors,
      userAgent: navigator.userAgent,
    };
    window.__E2E__ = report;
    try {
      await fetch('/__e2e/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report, null, 2) });
    } catch (e) {}
    document.title = (report.fail ? 'E2E FAIL ' + report.fail : 'E2E PASS') + ' (' + pass + '/' + results.length + ')';
  }

  // Stepped mode: the caller drives the suite, one or a few tests per call, so
  // background-tab timer throttling cannot stall the whole run.
  var idx = 0;
  var acc = [];
  async function steps(n) {
    var out = [];
    for (var k = 0; k < (n || 1) && idx < suite.length; k++) {
      var name = suite[idx][0];
      var fn = suite[idx][1];
      idx++;
      var rec;
      try {
        await fn();
        rec = { name: name, ok: true };
      } catch (e) {
        rec = { name: name, ok: false, error: (e && e.message) || String(e) };
        try { closeModals(); } catch (e2) {}
      }
      acc.push(rec);
      out.push(rec);
    }
    window.__E2E_ACC__ = acc;
    return { done: idx >= suite.length, ran: out, remaining: suite.length - idx };
  }

  window.runE2E = run;
  window.e2eSteps = steps;
  window.e2eInfo = function () { return { total: suite.length, next: idx, done: !!window.__E2E__ }; };
  window.e2ePost = function (report) {
    return fetch('/__e2e/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report, null, 2) });
  };
  window.e2eReport = function (extra) {
    var pass = acc.filter(function (r) { return r.ok; }).length;
    var report = Object.assign({
      pass: pass,
      fail: acc.length - pass,
      results: acc,
      pageErrors: pageErrors,
      consoleErrors: consoleErrors,
      userAgent: navigator.userAgent,
    }, extra || {});
    window.__E2E__ = report;
    return window.e2ePost(report).then(function () { return report; });
  };
  if (/[?&]step=1/.test(location.search)) return;
  if (/[?&]e2e=1/.test(location.search)) {
    window.addEventListener('DOMContentLoaded', function () { setTimeout(run, 100); });
  }
})();
