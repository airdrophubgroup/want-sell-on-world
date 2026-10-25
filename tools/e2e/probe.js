/* Timing probe for the E2E harness (served by test-server.cjs before app.js).
 *
 * Records real timings from navigation start so a slow first paint can be
 * measured instead of guessed: when the first listing card painted, when the
 * splash screen went away, and how many feed/username queries the boot made.
 * Read it with `window.__PROBE__` right after a load; it never changes the app.
 */
(function () {
  'use strict';

  var marks = {
    probeStart: Math.round(performance.now()),
    requests: { listings: 0, users: 0, usernames: 0 },
    firstCard: null,
    splashHidden: null,
    shellVisible: null,
  };
  window.__PROBE__ = marks;

  // Count backend calls from the very first byte, before app.js is evaluated.
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  if (realFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('/rest/v1/listings') !== -1) marks.requests.listings++;
      else if (url.indexOf('/rest/v1/users') !== -1) marks.requests.users++;
      else if (url.indexOf('usernames.worldcoin.org') !== -1) marks.requests.usernames++;
      return realFetch(input, init);
    };
  }

  function sample() {
    if (marks.firstCard == null && document.querySelector('#listingsContainer .listing-card')) {
      marks.firstCard = Math.round(performance.now());
    }
    if (marks.splashHidden == null) {
      var splash = document.getElementById('splashScreen');
      if (splash && getComputedStyle(splash).display === 'none') marks.splashHidden = Math.round(performance.now());
    }
    if (marks.shellVisible == null) {
      var shell = document.getElementById('appShell');
      if (shell && getComputedStyle(shell).display !== 'none') marks.shellVisible = Math.round(performance.now());
    }
  }

  var observer = new MutationObserver(sample);
  document.addEventListener('DOMContentLoaded', function () {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    sample();
  });
  setInterval(sample, 100);
})();
