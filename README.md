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
| Content Security Policy | CSP meta tag restricts resource loading |

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

<div align="center">
  <p><b>Built for the World App Community</b></p>
</div>