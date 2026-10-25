# WantSell — World Developer Portal submission pack

Everything the portal asks for, plus the exact values to paste. Follow it top to
bottom once and the app is ready for review.

---

## 1. Reset the portal entry (do this first)

The current submission cannot pass review as it stands, because of the name.

| Step | What to do | Why |
|---|---|---|
| 1 | Open the Developer Portal → your app → **Settings / App details** | — |
| 2 | Change **App name** from `Want sell on world` to **`WantSell`** | World's policy: *"Don't use 'World' in the name"* and *"Exclude the use of special characters"*. A name containing "World" is an automatic rejection risk. |
| 3 | Set the **description** (see §2) | Must be under 25 words, plain and accurate. |
| 4 | Set **App URL** to the deployed HTTPS URL (see §2) | Must load outside World App too; ours shows a clear "open in World App" screen instead of a blank page. |
| 5 | Set **Support email** to `airdrophubgroup@gmail.com` | A reachable support address is an explicit review requirement. |
| 6 | **World ID → Actions**: make sure an action with id `post_ad` exists, verification level **Device** | The app calls `MiniKit.commandsAsync.verify({ action: 'post_ad' })`. If this action is missing, verification fails with an error payload. |
| 7 | **Permissions**: enable **Wallet auth**, **Payments (pay)** and, if you want the post-ad reminder, **Notifications** | `pay()` must be approved in the portal or reviewers cannot post an ad. |
| 8 | If the portal forces you to delete and re-create the app, you get a **new `app_id`** — update `APP_ID` on line 7 of [app.js](app.js) and redeploy before resubmitting | A stale `app_id` makes every MiniKit command fail inside World App. |
| 9 | Submit for review | — |

> The app id in the code today is `app_06db98c492a19f80177b8d633f056982`. If this
> survives the reset, nothing in the code changes.

---

## 2. Field values to paste

| Portal field | Value |
|---|---|
| App name | `WantSell` |
| Description (24 words) | `Buy and sell second-hand items near you. List an item for 1 WLD, chat with the seller, and earn SOW coins for every ad.` |
| Category | Marketplace / Shopping |
| App URL | `https://<your-vercel-domain>` *(fill in — the repo has no deployed URL recorded)* |
| Support email | `airdrophubgroup@gmail.com` |
| World ID action | `post_ad` |
| Listing fee | 1 WLD per published ad |

### Assets

Per World's app guidelines:

- **App icon**: square, non-white background, PNG. The in-app mark is a white tag
  glyph on `#ff6b2c`, so use that background for the store icon.
- **Content card**: exactly **345 × 240 px**, exported at 3× (1035 × 720), PNG, no
  rounded corners, and keep the **bottom 94 px** free of important detail
  (World App overlays its own UI there).

---

## 3. Reviewer test script

Give reviewers these steps; each one is reachable from a cold open in World App.

1. Open WantSell inside World App → the home feed loads (empty state offers
   **Post the first ad** when there are no listings).
2. Tap **Connect Wallet** → World App asks for a signature → your World App name
   and shortened wallet address appear in **Profile**.
3. **Profile → Terms of Service / Privacy Policy / Delete my data** → legal pages
   open and scroll; deletion hides listings and opens a prefilled support email.
4. **Post Ad** → fill title, description, price, category, country, address,
   photos → the 1 WLD charge is disclosed in a confirmation dialog → World App
   payment sheet → ad appears in the feed and in **My Ads**.
5. Open any ad → **Chat Seller** sends a message; **Reviews** posts a rating.
6. **Profile → Verify World ID** (`post_ad` action) shows either a verified badge
   or a clear error message — never a dead button.

---

## 4. Code-side review readiness (already in this build)

| Risk reviewers flag | How the build handles it |
|---|---|
| "World" in the name / emoji / special characters | Name is `WantSell` everywhere in the UI, `<title>`, and README. |
| Unclear charge before payment | Posting shows a confirmation dialog with the price, recipient and refund policy **before** the payment sheet; photos upload only after it is accepted (`payConfirmTitle` / `payConfirmDesc`). |
| Payment fails with no explanation | The failure popup now carries the MiniKit error code, and a successful payment with a failed save shows a support reference. |
| Dead buttons | Wallet sign-in rejection shows a toast; World ID verify shows the error code; feed errors show a retry action. |
| Unreachable support / missing legal pages | Support mailto, Terms and Privacy live in Profile; the Privacy page documents exactly what the app stores (wallet, name, listings, photos, chats, reviews, optional location). |
| Stale/incorrect seller names | Listing cards resolve the name from the `users` table and fall back to "Seller" instead of printing `User_xxxxxx`. |
| No World ID / SDK integration | MiniKit `walletAuth`, `pay`, `verify`, `share` and notification permission are wired. |
| Splash hangs forever | A 15 s watchdog replaces the splash with a retry screen. |

---

## 5. Known limits before you submit

- **Payments must be approved** in the portal for `pay()` to work inside World
  App. If it is not approved the app now says so with an error code instead of
  silently failing, but posting still cannot complete.
- **Reviewers need WLD** to test posting, because the fee is kept deliberately.
  Say so in the "notes for reviewer" field so it is not read as a broken flow.
- **Seller-name repair** depends on the `users` table being readable with the
  anon key (it is today; `handleLogin` upserts into it).
- `SOW` rewards are still minted only by `award_sow_for_listing` in the database,
  so the migration in [SUPABASE_SQL_SOW_SECURITY.sql](SUPABASE_SQL_SOW_SECURITY.sql)
  must stay applied on the live project.
