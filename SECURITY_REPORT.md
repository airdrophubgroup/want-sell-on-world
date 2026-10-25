# WantSell — Security Audit Report

Date: 22 Oct 2026 · scope: everything a hostile visitor holding the public anon key can reach.

---

## TL;DR

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | A **Supabase `service_role` key is in git history** (`.env`, pushed to `origin/main`) | **CRITICAL** | **You must rotate it** (see below) |
| 2 | `delete_ad()` / `mark_ad_sold()` trust a wallet supplied by the caller | HIGH | Needs a walletAuth-verifying server |
| 3 | Wallet identity is asserted by the browser (no server-side signature check) | HIGH | Same server; needs design change |
| 4 | Anon key could `UPDATE`/`DELETE` any listing, chat or review row | HIGH | Fixed in `SUPABASE_SQL_ACCESS_HARDEN.sql` — **run it** |
| 5 | Storage bucket accepted unlimited anonymous uploads | HIGH | Fixed in the same SQL file |
| 6 | Chat view downloaded the **entire** `chats` table | MEDIUM | Fixed in [app.js](app.js) |
| 7 | Rate limits existed only in JavaScript | MEDIUM | Fixed in the SQL file (DB triggers) |
| 8 | One-review-per-buyer rule existed only in JavaScript | MEDIUM | Fixed (unique index) |
| 9 | Response headers were thin | LOW | Fixed in [vercel.json](vercel.json) |

---

## 1. What is public, and whether that is a problem

The whole app is a static bundle; everything in [app.js](app.js) is readable by anyone.

| Exposed value | Verdict |
|---|---|
| `SUPABASE_URL`, anon key (`role: anon`, decoded from the JWT) | Expected. The anon key is a *client* key; the database must assume every request using it is hostile. That is what RLS + `grant/revoke` enforce. |
| `APP_ID`, World ID action `post_ad` | Public by design (MiniKit). |
| `ADMIN_WALLET` | Public. It must never be an authorization signal — see finding 2. |
| Vercel URL, Supabase project ref | Public by design; they identify the app, not a secret. |
| `.env` in the working tree | Not tracked (`.gitignore`), and its contents are already public in the bundle. |

**No secret should ever live in `app.js`, `index.html` or any tracked file.** A service key, server JWT, Webhook secret or Minikit server secret belongs in Vercel/Supabase environment variables on the server only.

## 1b. CRITICAL: leaked `service_role` key in git history

Git history contains a committed `.env` with:

```
SUPABASE_SERVICE_KEY=eyJ…role…service_role…  for project ref  efmazirlyxllcyvcmwewd
```

Those commits **are ancestors of `origin/main`**, so the key is on GitHub for anyone who can read the repo (or clones a mirror/fork). `.env` is gone from the current tree, but history keeps it — `.gitignore` does not remove history.

The key belongs to project `efmazirlyxllcyvcmwewd`, which is **not** the live app project (`adicdkrfinbudpaqqjai`). If that old project still exists, its data is fully exposed: read, write, delete, schema changes, storage.

**Do this now (dashboard, not code):**

1. Supabase → pick project `efmazirlyxllcyvcmwewd` → **Settings → API → rotate `service_role` key**. If the project is abandoned, delete the project instead.
2. Rotate the **legacy JWT** on that project too (`anon` key shares the same signing secret).
3. Optionally purge history (`git filter-repo --path .env --invert-paths` then `--force` push). That rewrites every commit and breaks collaborators' clones, so do it only after rotating; rotating alone already neutralises the leak.

## 2-3. Wallet identity is self-asserted (HIGH)

Nothing verifies that the caller owns the wallet they name. `delete_ad(p_ad_id, p_wallet)` and `mark_ad_sold(p_ad_id, p_wallet)` compare `p_wallet` to the row — and seller addresses are public in every listing. So a visitor can call:

```
POST /rest/v1/rpc/delete_ad   {"p_ad_id": 123, "p_wallet": "0x8c5b…"}
```

and delete anyone's ad (the admin wallet works the same way). Self-review, chat impersonation and forged `seller_address` have the same root cause.

**Full fix** is a server step the client cannot fake: a Vercel serverless function (or Supabase Edge Function) that

1. verifies a signed `MiniKit` `walletAuth` message (nonce, signature, address) with `ethers`,
2. mints a short-lived session (or passes the verified wallet to `SECURITY DEFINER` functions),
3. and then all ownership checks use the verified wallet, never a client-supplied one.

Until that exists, run `SUPABASE_SQL_ACCESS_HARDEN.sql` — it closes the *unauthenticated edit* half (finding 4) so a stranger cannot rewrite rows, while the RPC ownership gap is documented as residual risk.

## 4-5. Database hardening — [SUPABASE_SQL_ACCESS_HARDEN.sql](SUPABASE_SQL_ACCESS_HARDEN.sql)

Idempotent; run in **Supabase → SQL Editor** after `SUPABASE_SQL_SOW_SECURITY.sql`.

- RLS + privileges on `listings`, `chats`, `reviews`, `users`: **append-only** for visitors. Reads stay public (a marketplace feed must be public), writes go through the existing RPCs only.
- `revoke update, delete on storage.objects from anon` — policies are OR-ed, so the revoke is the real gate; a single insert policy then allows only `listing/*.jpg|png|webp`, max 5 MB, no `..`.
- DB rate-limit triggers: 5 listings/hour/wallet, 30 chats/minute, 20 reviews/day, all enforced in Postgres regardless of what the client does.
- `unique (lower(seller_address), lower(buyer_address))` on reviews; `CHECK (rating between 1 and 5)`; username length 2-20 at the column level.

## 6. Chat privacy + scale — fixed in [app.js](app.js)

`openChat()` used to `select('*')` on the whole `chats` table and filter in the browser — every user downloaded every message ever sent. It now filters on the server for the exact conversation (both wallets + ad title) with a 500-row cap. At 100-500 users this is also the difference between a query and a table scan.

Also fixed: the "mark as sold" fallback updated `listings` by `id` **without** the owner filter; it now matches `seller_address` as well (the RPC path is unchanged).

## 7-9. Headers — [vercel.json](vercel.json)

Added `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, `Permissions-Policy` (camera/mic off, geolocation and payment self). Existing `nosniff` and `X-Frame-Options: DENY` kept; the CSP `<meta>` in `index.html` stays the primary content restriction.

## XSS review — clean

Every user-controlled field is passed through `escapeHtml()`/`escapeAttr()` before reaching `innerHTML`: listing titles, descriptions, prices, seller/buyer names, chat messages, review text, leaderboard usernames, admin listings, legal copy. The only unescaped `innerHTML` sinks are static templates and `t()` strings. The popup renderer escapes by default and only renders markup for callers that opt in.

---

## Testing: what ran, what did not

```bash
node security-tests/sow-security.mjs --static-only   # bundle-level checks
node security-tests/sow-security.mjs                 # live attack simulation
node security-tests/sow-security.mjs --burst 500     # 500 distinct users at once
node security-tests/sow-security.mjs --burst 500 --report burst.txt
```

| Suite | Result |
|---|---|
| Static (bundle cannot mint SOW) | **5 passed, 0 failed** |
| Live attacks (direct balance/ledger writes, replay, 50-way race, stale listing) | **Could not run** — the configured project host `adicdkrfinbudpaqqjai.supabase.co` does not resolve (`NXDOMAIN` on Google and Cloudflare DoH, confirmed by `npm run check:backend`). A paused or deleted Supabase project stops answering DNS; see `BACKEND_RECOVERY.md` |
| Burst **500 users** (500 wallets post simultaneously, each earns exactly one SOW, every balance ends at 1) | **Could not run**, same reason — the database has to answer first |

Run the last two from any machine that can open the app, and read the `--report` file; exit code `1` means a real vulnerability, `2` means it could not reach the project.

Note: after the hardening SQL, the burst suite's "backdate a listing" fixture is intentionally blocked (it needs `UPDATE`, which anon no longer has) and reports `SKIP`, not a failure.

## Before you ship

1. **Rotate the leaked `service_role` key** (finding 1b) — this is the one item that cannot wait.
2. Run `SUPABASE_SQL_ACCESS_HARDEN.sql`, then re-run the static + live suites and the `--burst 500` run.
3. Decide on the walletAuth-verifying server (findings 2-3); it is the last thing standing between the app and "anyone can touch anything".
