# Backend down: why the app says "Network error"

## What was measured

```
npm run check:backend
```

```
Project : https://adicdkrfinbudpaqqjai.supabase.co
Key role: anon  (ref adicdkrfinbudpaqqjai)
FAIL  dns — adicdkrfinbudpaqqjai.supabase.co does not resolve (ENOTFOUND)
```

Two independent public resolvers (Google DoH and Cloudflare DoH) both answer
`NXDOMAIN` for the project host, and every request from the app therefore fails
before it ever leaves the phone. `https://supabase.co` itself resolves, so this
is not a DNS problem on the device or in the sandbox.

**NXDOMAIN means one of two things, and the dashboard tells you which:**

| Dashboard state | What it means | Fix |
| --- | --- | --- |
| Project listed, status **Paused** | Free projects pause after ~1 week without activity. Data is intact and it can be resumed for up to **1 year**. | Open the project → **Resume project**. DNS comes back in a minute or two. |
| Project **does not exist** in the account | Project deleted. Supabase deletion is permanent (backups go with it). | Rebuild with the steps below. |

The Supabase docs confirm paused projects stop answering their hostname, so
`NXDOMAIN` on its own is *not* proof of deletion.

## If the project was paused — this is the whole fix

1. Open <https://supabase.com/dashboard> and select the org that owns
   `adicdkrfinbudpaqqjai`.
2. Open the project, press **Resume project**, wait until status is
   *Active*.
3. Run `npm run check:backend` again. Expect every line to be `PASS`.
4. Open the mini app in World App. Feed, username, chat and SOW all come back —
   no code change needed.

Tip: free projects pause when they get no queries. A weekly `npm run
check:backend` (or a scheduled request to `/rest/v1/`) keeps it awake, and
upgrading the project to the paid plan disables pausing.

## If the project is gone — rebuild it

The repo never stored the table definitions, so `SUPABASE_SQL_SCHEMA.sql` now
does. In a new project:

1. **SQL Editor**, run in this order (each file is idempotent):
   1. `SUPABASE_SQL_SCHEMA.sql` — tables, RLS, `listing` storage bucket
   2. `SUPABASE_SQL_SOW_SECURITY.sql` — server-side SOW credits + ledger
   3. `SUPABASE_SQL_DELETE.sql` — `delete_ad()`
   4. `SUPABASE_SQL_FIX.sql` — `mark_ad_sold()`
   5. `SUPABASE_SQL_ACCESS_HARDEN.sql` — rate limits, append-only rules
   6. `SUPABASE_SQL_USERNAME_GUARD.sql` — one username per wallet, username-only writes
2. **Project Settings → API**: copy the Project URL and the `anon` /
   `publishable` key.
3. Replace the two constants at the top of [`app.js`](app.js):
   `SUPABASE_URL` and `SUPABASE_KEY`. Nothing else in the app hardcodes them.
4. `npm run check:backend` → all `PASS`.
5. Commit and let Vercel redeploy, then re-test inside World App.

Old listings, users, chats and reviews cannot be recreated from the repo — if
the project is really deleted they are gone, unless you kept your own database
backup (`pg_dump`) outside Supabase.

## About the "network error" the app used to show

The feed used to render *"Network error. Please check your connection and try
again."* for **every** failed query — DNS failure, paused project, missing
table, RLS denial, all of it — and its `Try again` button called a
module-scoped function that `onclick` could not see, so the button did nothing.
That is fixed in `app.js`:

- offline, timeout, unreachable host, missing schema and server errors now
  produce different titles and details (`connOffline`, `connTimeout`,
  `connUnreachable`, `connSchema`, `connServer`), plus the technical code in
  brackets, e.g. `(UNREACHABLE)` or `(PGRST205)`;
- the client library's own retries still run first (a dead host settles in
  about 7 s), and `AbortSignal.timeout(10 s)` catches a server that accepts the
  connection but never answers;
- the retry button now calls `window.fetchListings()`, which exists;
- the real cause is logged once as `[FEED] listings query failed: …` so a bug
  report can carry the exact code.

## Username not appearing (airdrophuman)

Five separate bugs, all fixed:

1. **CSP blocked the lookup.** `index.html` allowed `https://*.world.org` but
   not `https://usernames.worldcoin.org`, the host MiniKit uses to turn a wallet
   address into a username. The SDK's own profile request was refused by the
   browser, so `MiniKit.user` stayed empty. `connect-src` now includes
   `https://usernames.worldcoin.org` and `https://*.worldcoin.org`.
2. **The app never asked directly.** MiniKit 1.9.6 has no `MiniKit.getUser()`
   (that code path was dead) and `walletAuth` returns only
   address/message/signature. `app.js` now resolves the name itself with
   `MiniKit.getUserByAddress(address)`, falls back to the public registry
   (`POST https://usernames.worldcoin.org/api/v1/query`), caches it per wallet
   in `localStorage` (`ws_username_<address>`), and retries a few times on a
   cold start.

3. **A name was cached without its wallet.** `localStorage.currentUsername`
   stored the last name with no owner, so on a shared device the next account
   could be shown the previous account's username, and `seller_name` was written
   from it when posting. The key is gone: a name is only read from
   `ws_username_<address>` for the wallet that owns it, the header gets the name
   from the `users` row first (one small query), and a listing whose stored
   snapshot carries the viewer's own name against a different address shows
   `Seller` instead. `SUPABASE_SQL_USERNAME_GUARD.sql` adds the matching database
   rule: one username belongs to exactly one wallet, and the browser can only
   write the username column, never the wallet key.

4. **"Verify World ID" failed with a generic error.** MiniKit 1.9.6 sends no
   `verification_level` when the caller omits it, and World App then asks for an
   **Orb** proof while the portal action is registered at **Device** level. The
   app now always sends `VERIFY_LEVEL` (`device`, same value the action must have
   in the portal). Every refusal prints the code, action, level and app id, both
   in the popup and as one `[VERIFY] …` console line, so
   `generic_error`/`credential_unavailable`/`invalid_network` are no longer a
   dead end. See [WORLD_REVIEW.md](WORLD_REVIEW.md#if-verify-world-id-fails).

5. **Outside World App the page looked dead.** The splash element doubles as the
   "open in World App" screen, but `hideSplash()` had already faded it to
   `opacity: 0`; the blocker was then re-shown at `z-index: 99999` with opacity
   still 0, so a reviewer opening the App URL saw an invisible overlay that ate
   every tap. The blocker now restores opacity, hides the app shell and cannot be
   faded away.

Verified against the live registry:

```
GET  https://usernames.worldcoin.org/api/v1/airdrophuman
POST https://usernames.worldcoin.org/api/v1/query  {"addresses":["0x8c5b…b6a1"]}
-> {"username":"airdrophuman", ...}
```

So the name is available and is now picked up on boot, after `walletAuth`, and
when the app comes back online. When a name genuinely cannot be resolved the
header shows `0x8c5b...b6a1` instead of a fake `User_xxxx`.
