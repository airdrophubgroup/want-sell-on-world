<div align="center">

# WantSell

### Buy & Sell Locally in World App

<img src="https://img.shields.io/badge/Status-Live-10b981?style=for-the-badge" /> <img src="https://img.shields.io/badge/Platform-World%20App-6366f1?style=for-the-badge" /> <img src="https://img.shields.io/badge/Network-Worldchain-8b5cf6?style=for-the-badge" /> <img src="https://img.shields.io/badge/UI-Glassmorphism-06b6d4?style=for-the-badge" />

</div>

---

## About

WantSell is a location-aware product marketplace mini-app built for World App. Users list products, discover items nearby, chat with sellers, and earn SOW Coins with every ad posted.

---

## Features

- **World App Only** - Runs exclusively inside World App via MiniKit wallet authentication. Blocked outside World App.
- **GPS Location & Distance Filtering** - Auto-detects user location, filters listings within 5-500 km radius.
- **1 WLD Listing Fee** - Posting an ad costs 1 WLD, sent to admin wallet via MiniKit `pay()` command.
- **SOW Coin Rewards** - Earn 1 SOW Coin per ad posted. Leaderboard shows top sellers.
- **Real-Time Chat** - Direct messaging between buyers and sellers with XSS-safe rendering.
- **Ratings & Reviews** - Star ratings and text reviews for sellers. Self-review blocked.
- **Sold Out Tracking** - Mark ads as sold. SOW coins are never deducted.
- **Admin Dashboard** - Admin-only panel for managing listings and monitoring stats.
- **Offline Handling** - Detects disconnections, shows banner, auto-reloads when back online.
- **Privacy Consent** - Location access requested with explicit consent before GPS detection.

---

## Security

| Feature | Details |
|---------|---------|
| XSS Prevention | `escapeHtml()` on all user inputs and outputs |
| Input Validation | Title (3-80), Description (10-500), Username (2-20), Chat (300), Review (200) |
| Rate Limiting | Login (5s), Post Ad (10s), Chat (1s), Review (5s) |
| Phone Number Block | Regex detection prevents contact info in ads |
| Prohibited Words | 26 blocked keywords (weapons, drugs, scams, etc.) |
| URL Block | External links blocked in descriptions |
| Self-Review Block | Users cannot review themselves |
| Ownership Verification | Only ad owner can mark as sold |
| Wallet Address Privacy | No wallet addresses shown in user-facing UI |
| Content Security Policy | CSP meta tag restricts resource loading (World username registry explicitly allowed) |
| Backend health check | `npm run check:backend` verifies DNS, anon key, tables, storage bucket and the SOW RPC |

If the feed shows **Server unavailable (UNREACHABLE)**, the Supabase project
itself is not answering: free projects pause after about a week of inactivity.
Resume it in the dashboard, then re-run `npm run check:backend`. Full runbook:
[BACKEND_RECOVERY.md](BACKEND_RECOVERY.md).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JavaScript (ES Modules), HTML5, CSS3 |
| Design | Premium Glassmorphism - dark glass, gradients, glow effects |
| Web3 SDK | `@worldcoin/minikit-js` v1.9.6 |
| Backend | Supabase (PostgreSQL, Storage Buckets) |
| Hosting | Vercel |
| MiniKit | `walletAuth()` for login, `pay()` for 1 WLD listing fee |

---

## How It Works

1. **Open in World App** - App detects World App environment via MiniKit
2. **Connect Wallet** - Silent `walletAuth()` on load, or manual via Connect button
3. **Browse Listings** - Filter by country, category, search, and distance radius
4. **Post an Ad** - Fill form, detect GPS, pay 1 WLD, earn +1 SOW Coin
5. **Chat with Seller** - Tap Chat on any listing to start messaging
6. **Leave Reviews** - Rate sellers after transactions
7. **Check Leaderboard** - See top SOW Coin holders

---

## App Guidelines Compliance

- **Naming**: "WantSell" - no "World" in name, no emojis, no generic terms
- **Safety**: No prohibited content, no misleading claims, no impersonation
- **Privacy**: Location consent before GPS, data minimization, no wallet address exposure
- **Technical**: Handles poor connectivity, no infinite loading, works on Android + iOS
- **MiniKit Integration**: Live `walletAuth()` + `pay()` commands via CDN v1.9.6
- **User Support**: Email provided in Profile screen
- **Legal**: Terms of Service, Privacy Policy and a data-deletion request live in Profile
- **Submission**: Portal field values, assets and the reviewer test script are in [WORLD_REVIEW.md](WORLD_REVIEW.md)

---

## Project Structure

```
want-sell-on-world/
  index.html      # App shell, screens, modals
  app.js          # Core logic, MiniKit, Supabase, security
  style.css       # Premium glassmorphism dark theme
  vercel.json     # Vercel deployment config
  .gitattributes  # Line ending normalization
  README.md
```

---

## Getting Started

1. Open inside **World App**
2. App auto-connects wallet on first visit
3. Browse listings on Home tab
4. Tap **Post Ad** to list a product (1 WLD fee)
5. Earn **+1 SOW Coin** per ad posted

---

## SOW Coin security (required setup)

SOW coins are **minted by the database only**. The browser never writes a
balance: after a listing is created it calls `award_sow_for_listing(ad_id)`, a
`SECURITY DEFINER` function that

- takes the wallet from the listing row, not from the request,
- records one `sow_ledger` row per listing (`UNIQUE listing_id`), so retries,
  double taps and concurrent calls cannot double-credit,
- refuses listings that are not `active` or older than 10 minutes,
- caps a wallet at 20 coins per day,
- increments the balance atomically.

**Apply the migration once** in Supabase → SQL Editor:

```
SUPABASE_SQL_SOW_SECURITY.sql
SUPABASE_SQL_USERNAME_GUARD.sql
```

`SUPABASE_SQL_USERNAME_GUARD.sql` makes a username belong to exactly one wallet
and lets the browser write only the `username` column, so a name can never be
shared between wallets or re-pointed at someone else's address. Run
`npm run e2e:serve` afterwards: the suite asserts that every card, chat and
review shows the name of the wallet it belongs to.

Then verify the lockdown from a machine that can reach the project:

```bash
node security-tests/sow-security.mjs --static-only   # bundle-level checks
node security-tests/sow-security.mjs                 # live attack simulation
node security-tests/sow-security.mjs --burst 400     # 400 concurrent users
```

The live suite acts as a hostile visitor using the public anon key: it tries to
write `sow_balances` and `sow_ledger` directly, replays awards, races 50 calls
against one listing, and checks each of 400 wallets receives exactly one coin.
Exit code `1` means a real vulnerability, `2` means it could not reach the
project.

---

## End-to-end tests (no World App needed)

`tools/e2e/mock-backend.cjs` is a small PostgREST stand-in and
`tools/e2e/e2e.js` drives the real `index.html`/`app.js` through every flow:
feed, search and filters, ad details, chat, reviews, my ads, posting (including a
payment that never answers), profile, leaderboard, legal pages, offline banner,
server-error retry and the admin panel. MiniKit commands are mocked per run, so
success and failure paths are both covered without a phone.

```bash
npm run e2e:mock                 # mock database on :3457
npm run e2e:serve                # test build of the app on :3456
# open http://127.0.0.1:3456/?e2e=1  (add &step=1 to drive it from the console)
```

Results are written to `tools/e2e/e2e-result.json` (38 checks, all should pass).
The suite reseeds the mock database before each run, so it can be run repeatedly
in the same tab. It also asserts the MiniKit payloads (`verify` action/signal,
`pay` reference/tokens/description, `requestPermission` permission) against the
1.9.6 contract, so an SDK mismatch fails the build instead of silently doing
nothing in World App.

`MOCK_DELAY_MS=250 npm run e2e:mock` simulates a mobile round trip. `probe.js`
records `window.__PROBE__` (first card, splash, query counts) for feed timing.
This suite never touches the hosted Supabase project; check the real backend
itself with `npm run check:backend`.

### Feed performance

Measured on the harness with a 250 ms round trip, cold cache / warm cache:

| | before | after |
|---|---|---|
| First listing card | 716 ms | 462 ms / 280 ms |
| Splash dismissed | 2833 ms | 827 ms / 637 ms |
| Listing queries per launch | 3 | 1 |
| `users` queries per launch | 3 | 1 |

The feed now paints from a `sessionStorage` cache before the network, asks once
(60 rows, card columns only, newest first), patches seller names after paint, and
requests 480px thumbnails from Supabase Storage instead of full-size uploads.
The silent `walletAuth` no longer gates the first screen.

### Who is who

Every visible name belongs to the wallet it is printed for:

- a name is cached as `ws_username_<address>`, never as one shared value, so a
  second account on the same device cannot inherit the first one's username;
- the `users` table is queried for the addresses on screen only (one `or=`
  filter of `ilike` matches, max 60), instead of downloading the whole table;
- a listing keeps the name it was posted with, but that snapshot is used only
  when the wallet has no live name and it is not the viewer's own name on a
  foreign address (a shared-device leftover once printed the viewer's name on
  someone else's ad, so it now shows `Seller`);
- chats and reviews use the same resolved name as the card, not the snapshot;
- the header asks our own table for the signed-in wallet's name first (one small
  query) and only then the World App username registry.

---

<div align="center">
  <p><b>Built for the World App Community</b></p>
</div>