import { MiniKit, Tokens, tokenToDecimals } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.9.6/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://adicdkrfinbudpaqqjai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaWNka3JmaW5idWRwYXFxamFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNzM4MzMsImV4cCI6MjEwMTc0OTgzM30.ksv1zdQVimQTNWnrHaRqEXcLw7-3G6_zjAyEOZZkr0s';
const ADMIN_WALLET = '0x8c5b20653abcb87f6b3a7cb469d8623e94bfb6a1';
const APP_ID = 'app_06db98c492a19f80177b8d633f056982';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let userWallet = null;
let currentUsername = null;
let currentChatSeller = null;
let currentLat = 28.6139;
let currentLng = 77.2090;

function checkWorldAppEnvironment() {
  let miniOk = false;
  try { miniOk = typeof MiniKit !== 'undefined' && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled(); } catch (e) {}
  if (!miniOk) {
    document.getElementById('splashScreen').innerHTML = '<div style="position:fixed;inset:0;background:#fff;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Inter,sans-serif;text-align:center;padding:20px;"><div style="background:#fef2f2;border:1px solid #fecaca;padding:30px;border-radius:16px;max-width:380px;"><h1 style="color:var(--danger);font-size:22px;margin-bottom:12px;font-weight:700;">Access Denied</h1><p style="color:var(--text-secondary);font-size:14px;line-height:1.6;margin-bottom:20px;">This app can only be used inside <b>World App</b>. Please open it from World App to continue.</p><div style="background:var(--danger);color:#fff;font-weight:600;padding:12px 20px;border-radius:10px;font-size:14px;">Open in World App</div></div></div>';
    document.getElementById('splashScreen').style.display = 'flex';
    return false;
  }
  return true;
}

function waitForMiniKitReady(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      let miniOk = false;
      try { miniOk = typeof MiniKit !== 'undefined' && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled(); } catch (e) {}
      if (miniOk) { resolve(true); }
      else if (Date.now() - start > timeoutMs) { resolve(false); }
      else { setTimeout(check, 100); }
    })();
  });
}

// SECURITY: HTML SANITIZER (XSS PREVENTION)
// ==========================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');
}
function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ==========================================
// SECURITY: INPUT VALIDATION & LIMITS
// ==========================================
const MAX_TITLE_LEN = 80, MAX_DESC_LEN = 500, MAX_USERNAME_LEN = 20, MIN_USERNAME_LEN = 2;
const MAX_REVIEW_LEN = 200, MAX_PRICE_VAL = 1000000, MIN_PRICE_VAL = 0.01, MAX_CHAT_LEN = 300;

function sanitizeUsername(n){ if(!n||typeof n!=='string')return ''; return n.replace(/[^a-zA-Z0-9 _\-]/g,'').trim(); }
function validateUsername(n){ const c=sanitizeUsername(n); if(c.length<MIN_USERNAME_LEN||c.length>MAX_USERNAME_LEN)return{valid:false,error:`Username must be ${MIN_USERNAME_LEN}-${MAX_USERNAME_LEN} chars.`}; return{valid:true,clean:c}; }
function validatePrice(p){ const n=parseFloat(p); if(isNaN(n)||n<MIN_PRICE_VAL||n>MAX_PRICE_VAL)return{valid:false,error:`Price must be ${MIN_PRICE_VAL}-${MAX_PRICE_VAL} WLD.`}; return{valid:true,clean:n.toFixed(2)}; }
function validateTitle(t){ const c=(t||'').trim(); if(c.length<3||c.length>MAX_TITLE_LEN)return{valid:false,error:`Title must be 3-${MAX_TITLE_LEN} chars.`}; return{valid:true,clean:c}; }
function validateDescription(d){ const c=(d||'').trim(); if(c.length<10||c.length>MAX_DESC_LEN)return{valid:false,error:`Description must be 10-${MAX_DESC_LEN} chars.`}; return{valid:true,clean:c}; }
function validateAddress(a){ const c=(a||'').trim(); if(c.length<3||c.length>200)return{valid:false,error:'Address must be 3-200 chars.'}; return{valid:true,clean:c}; }
function validateChatMsg(m){ const c=(m||'').trim(); if(!c)return{valid:false,error:'Empty message.'}; if(c.length>MAX_CHAT_LEN)return{valid:false,error:`Max ${MAX_CHAT_LEN} chars.`}; return{valid:true,clean:c}; }

// SECURITY: RATE LIMITING
const rateLimits = {};
function checkRateLimit(action, cooldownMs) {
  const now = Date.now();
  if (rateLimits[action] && now - rateLimits[action] < cooldownMs) return false;
  rateLimits[action] = now;
  return true;
}

// ==========================================
// ADDRESS BOOK - Maps wallet to username
// ==========================================
function getDisplayName(addr) { return addr ? addr.substring(0, 10) + '...' : 'Unknown'; }
function isValidEthAddress(a) { return /^0x[a-fA-F0-9]{40}$/.test(a); }

// ==========================================
// TAB NAVIGATION
// =========================================
window.switchTab = function(screenId) {
  // Tabs that require wallet: Post Ad, My Ads, Profile
  if (['screenPost', 'screenMyAds', 'screenProfile'].includes(screenId)) {
    if (!requireWallet()) return;
  }
  document.querySelectorAll('.tab-item').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('data-screen') === screenId) t.classList.add('active');
  });
  ['screenHome','screenPost','screenMyAds','screenProfile'].forEach(s => {
    const el = document.getElementById(s);
    if (el) {
      if (s === screenId) {
        el.style.display = 'flex';
        el.classList.add('active');
        el.style.animation = 'fadeIn 0.25s ease';
      } else {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    }
  });
  const fab = document.getElementById('fabPost');
  if (fab) fab.style.display = (screenId === 'screenHome') ? 'flex' : 'none';
  if (screenId === 'screenMyAds') window.openMyAdsScreen();
  if (screenId === 'screenProfile') window.renderProfile();
  if (screenId === 'screenHome') fetchListings();
};

// ==========================================
// SPLASH + APP INIT
// =========================================
function showSkeleton(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="skeleton skeleton-card" style="display:flex; gap:12px; padding:12px; align-items:center;"><div class="skeleton skeleton-thumb"></div><div class="card-info"><div class="skeleton skeleton-text" style="width:70%;"></div><div class="skeleton skeleton-text" style="width:50%;"></div><div class="skeleton skeleton-text-sm"></div></div></div>';
  }
  return html;
}

function initApp() {
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-screen');
      window.switchTab(targetId);
    });
  });

  // Category chip click handling
  const categoryChips = document.querySelectorAll('.category-chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.getAttribute('data-cat');
      document.getElementById('categoryFilter').value = cat;
      fetchListings();
    });
  });

  // FAB button
  const fabBtn = document.getElementById('fabPost');
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      if (!requireWallet()) return;
      window.switchTab('screenPost');
    });
  }

  const detBtn = document.getElementById('detectLocationBtn');
  if (detBtn) detBtn.addEventListener('click', () => window.detectLocation());

  // Dismiss splash and show app - ALWAYS runs regardless of CDN
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    const shell = document.getElementById('appShell');
    const fab = document.getElementById('fabPost');
    if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.5s'; setTimeout(() => splash.style.display = 'none', 500); }
    if (shell) shell.style.display = 'flex';
    if (fab) fab.style.display = 'flex';
    console.log('[APP] Splash dismissed, app shell visible');
  }, 1500);
}

// ==========================================
// UNIVERSAL NEON POPUP SYSTEM
// ==========================================
let popupResolve = null;
window.showNeonPopup = function(title, text, icon = 'Notice', type = 'alert') {
  return new Promise((resolve) => {
    document.getElementById('neonPopupIcon').innerText = icon;
    document.getElementById('neonPopupTitle').innerText = title;
    document.getElementById('neonPopupText').innerHTML = text;

    const inputContainer = document.getElementById('neonPopupInputContainer');
    const alertBtns = document.getElementById('neonPopupAlertBtnContainer');
    const confirmBtns = document.getElementById('neonPopupConfirmBtnContainer');
    const popupBox = document.getElementById('neonPopupBox');
    
    inputContainer.style.display = 'none';
    alertBtns.style.display = 'none';
    confirmBtns.style.display = 'none';

    if (type === 'confirm') {
      confirmBtns.style.display = 'flex';
      popupBox.style.borderColor = 'var(--danger)';
      popupBox.style.boxShadow = 'var(--shadow-lg)';
      document.getElementById('neonPopupTitle').style.color = 'var(--danger)';
    } else if (type === 'prompt') {
      inputContainer.style.display = 'block';
      document.getElementById('neonPopupInput').value = '';
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'Submit';
      popupBox.style.borderColor = 'var(--success)';
      popupBox.style.boxShadow = 'var(--shadow-lg)';
      document.getElementById('neonPopupTitle').style.color = 'var(--success)';
    } else {
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'OK';
      popupBox.style.borderColor = 'var(--primary)';
      popupBox.style.boxShadow = 'var(--shadow-lg)';
      document.getElementById('neonPopupTitle').style.color = 'var(--primary)';
    }

    document.getElementById('neonPopup').style.display = 'flex';
    popupResolve = resolve;

    document.getElementById('neonPopupAlertBtn').onclick = function() {
      if (type === 'prompt') {
        const val = document.getElementById('neonPopupInput').value.trim();
        if(!val) closeNeonPopup("User_" + Math.floor(Math.random()*10000));
        else closeNeonPopup(val);
      } else {
        closeNeonPopup(true);
      }
    };
    
    document.getElementById('neonPopupConfirmYesBtn').onclick = () => closeNeonPopup(true);
    document.getElementById('neonPopupConfirmNoBtn').onclick = () => closeNeonPopup(false);
  });
};

window.closeNeonPopup = function(result) {
  document.getElementById('neonPopup').style.display = 'none';
  if (popupResolve) {
    popupResolve(result);
    popupResolve = null;
  }
};

window.copyAddress = async function(address) {
  try {
    await navigator.clipboard.writeText(address);
    await showNeonPopup('Copied!', 'Wallet Address copied to clipboard.', 'OK');
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = address;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      await showNeonPopup('Copied!', 'Wallet Address copied to clipboard.', 'OK');
    } catch (ex) {}
    document.body.removeChild(textArea);
  }
}







// WALLET REQUIRED CHECK — blocks action if not logged in
function requireWallet() {
  if (userWallet && currentUsername) return true;
  showWalletRequiredOverlay();
  return false;
}

function showWalletRequiredOverlay() {
  // Remove existing overlay if any
  const existing = document.getElementById('walletRequiredOverlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'walletRequiredOverlay';
  overlay.className = 'wallet-required-overlay';
  overlay.innerHTML = `
    <div class="wallet-required-box">
      <div class="wallet-required-icon">🔐</div>
      <h2 class="wallet-required-title">Connect Your Wallet</h2>
      <p class="wallet-required-text">You need to connect your wallet to use this feature.</p>
      <button class="wallet-required-btn" onclick="document.getElementById('walletRequiredOverlay').remove(); document.getElementById('loginBtn').click();">Connect Wallet</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function randomAlphaNumeric(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

document.addEventListener('DOMContentLoaded', async () => {
  try { MiniKit.install(APP_ID); } catch(e) {}

  // Restore saved wallet immediately
  const savedAddress = localStorage.getItem('userWallet');
  const savedUsername = localStorage.getItem('currentUsername');
  if (savedAddress && !userWallet) {
    userWallet = savedAddress;
    currentUsername = savedUsername || ('User_' + savedAddress.substring(2, 8));
    document.getElementById('loginBtn').innerText = currentUsername;
      updateSowBadge();
    detectUserCurrentPosition();
    fetchListings();
  }

  const ready = await waitForMiniKitReady();
  if (!ready) { checkWorldAppEnvironment(); return; }

  // Silent wallet auth (like Dice Duel)
  if (typeof MiniKit !== 'undefined') {
    try {
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: randomAlphaNumeric(24),
        requestId: 'req_silent_' + Date.now(),
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 60 * 1000),
        statement: 'Sign in to WantSell',
      });
      if (finalPayload?.status === 'success' && finalPayload?.address) {
        userWallet = finalPayload.address;
        const { data: userData } = await supabase.from('users').select('username').eq('wallet_address', userWallet).single();
        currentUsername = userData?.username || ('User_' + userWallet.substring(2, 8));
        localStorage.setItem('userWallet', userWallet);
        localStorage.setItem('currentUsername', currentUsername);
        document.getElementById('loginBtn').innerText = currentUsername;
      updateSowBadge();
        detectUserCurrentPosition();
      }
    } catch(err) {}
  }

  setupUI();
  initApp();
  fetchListings();
  if (!userWallet) detectUserCurrentPosition();
});

function setupUI() {
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('adForm').addEventListener('submit', handlePostAd);
  document.getElementById('countryFilter').addEventListener('change', fetchListings);
  document.getElementById('categoryFilter').addEventListener('change', fetchListings);

  const rangeInput = document.getElementById('distanceRange');
  rangeInput.addEventListener('input', (e) => {
    document.getElementById('rangeValue').innerText = e.target.value + ' km';
  });
  rangeInput.addEventListener('change', fetchListings);

  let searchDebounceTimer;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(fetchListings, 300);
    });
  }

  // OFFLINE INDICATOR — technical requirement: handle disconnections
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offlineBanner';
  offlineBanner.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;z-index:10000;background:var(--danger);color:#fff;text-align:center;padding:6px;font-size:0.78rem;font-weight:600;font-family:inherit;';
  offlineBanner.textContent = '\u26a0\ufe0f You are offline. Some features may be unavailable.';
  document.body.appendChild(offlineBanner);
  window.addEventListener('online', () => {
    offlineBanner.style.display = 'none';
    if (supabase) fetchListings();
  });
  window.addEventListener('offline', () => {
    offlineBanner.style.display = 'block';
  });
}

async function handleLogin() {
  if (!checkWorldAppEnvironment()) return;
  if (!supabase) { showNeonPopup('Offline', 'Database not available.', 'OK'); return; }
  if (!checkRateLimit('login', 5000)) { showNeonPopup('Slow Down', 'Please wait a few seconds.', 'OK'); return; }
  try {
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce: randomAlphaNumeric(24),
      requestId: 'req_login_' + Date.now(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 60 * 1000),
      statement: 'Sign in to WantSell',
    });
    if (finalPayload?.status === 'success' && finalPayload?.address) {
      if (!isValidEthAddress(finalPayload.address)) { showNeonPopup('Error', 'Invalid wallet address.', 'OK'); return; }
      userWallet = finalPayload.address;
      const { data: userData } = await supabase.from('users').select('username').eq('wallet_address', userWallet).single();
      if (userData && userData.username) {
        currentUsername = userData.username;
      } else {
        let usernameInput = await showNeonPopup('Welcome!', 'Choose a Username (2-20 chars):', 'OK', 'prompt');
        let attempts = 0;
        while (attempts < 3) {
          const v = validateUsername(usernameInput);
          if (v.valid) { currentUsername = v.clean; break; }
          attempts++;
          if (attempts >= 3) { currentUsername = 'User_' + Math.floor(Math.random() * 10000); break; }
          usernameInput = await showNeonPopup('Invalid', v.error, 'OK', 'prompt');
        }
        const { data: exUser } = await supabase.from('users').select('wallet_address').eq('wallet_address', userWallet).single();
        if (!exUser) { await supabase.from('users').upsert([{ wallet_address: userWallet, username: currentUsername }]); }
      }
      localStorage.setItem('userWallet', userWallet);
      localStorage.setItem('currentUsername', currentUsername);
      document.getElementById('loginBtn').innerText = currentUsername;
      updateSowBadge();
      detectUserCurrentPosition();
      fetchListings();
    } else {
      showNeonPopup('Connection Failed', 'Wallet connect failed.', 'OK');
    }
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message || err);
    showNeonPopup('Error', 'Wallet connect error. Try again.', 'OK');
  }
}

function detectUserCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
    }, (err) => {
      console.log("GPS position default used");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
}

window.detectLocation = async function() {
  if (!requireWallet()) return;
  // PRIVACY: Ask consent before requesting location
  const consent = await showNeonPopup('Location Access', 'WantSell needs your location to show nearby listings and set your ad location. Your location is only used for this purpose.', 'OK', 'confirm');
  if (!consent) return;
  const addressField = document.getElementById('adAddress');
  addressField.value = "Detecting precise location...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}`);
        const data = await response.json();
        if (data && data.display_name) {
          addressField.value = data.display_name;
        } else {
          addressField.value = `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`;
        }
      } catch (e) {
        addressField.value = `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`;
      }
    }, async (error) => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const locData = await res.json();
        if (locData && locData.city) {
          currentLat = locData.latitude;
          currentLng = locData.longitude;
          addressField.value = `${locData.city}, ${locData.region}, ${locData.country_name}`;
        } else {
          addressField.value = "";
          await showNeonPopup('Notice', 'Could not auto-detect. Please type manually.', 'OK');
        }
      } catch (err) {
        addressField.value = "";
        await showNeonPopup('Error', 'Location permissions denied and fallback failed. Please type manually.', 'OK');
      }
    }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
  } else {
    addressField.value = "";
    await showNeonPopup('Error', 'Geolocation not supported. Please type manually.', 'OK');
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); 
}

function containsPhoneNumber(text) {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/;
  return phoneRegex.test(text);
}

// ==========================================
// OLX-STYLE: TIME AGO HELPER
// ==========================================
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const seconds = Math.floor((now - past) / 1000);
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getConditionBadge(cond) {
  const map = {
    'new': { text: 'Brand New', cls: 'new' },
    'like_new': { text: 'Like New', cls: 'like-new' },
    'good': { text: 'Good', cls: 'good' },
    'fair': { text: 'Fair', cls: 'fair' },
    'used': { text: 'Used', cls: 'used' }
  };
  return map[cond] || map['used'];
}

function getPriceTypeBadge(pt) {
  if (pt === 'negotiable') return { text: 'Negotiable', cls: 'negotiable' };
  return { text: 'Fixed', cls: 'fixed' };
}

// ==========================================
// PROHIBITED / ILLEGAL WORDS CHECKER
// ==========================================
const forbiddenWords = ['weapon', 'drug', 'gun', 'hack', 'counterfeit', 'illegal', 'adult', 'bomb', 'firearm', 'steal', 'scam', 'phishing', 'crack', 'exploit', 'cheat', 'fraud', 'narcotics', 'meth', 'cocaine', 'terrorist', 'kill', 'murder', 'porn', 'nsfw', 'sex', 'prostitution'];

function validateListingContent(title, description) {
  const content = (title + " " + description).toLowerCase();
  for (let word of forbiddenWords) {
    if (content.includes(word)) {
      return word;
    }
  }
  return null;
}

// ==========================================
// FULL-SCREEN IMAGE SLIDER SYSTEM
// ==========================================
let viewerImages = [];
let currentImageIndex = 0;

window.openImageViewer = function(imagesStr, index) {
  viewerImages = imagesStr.split('|');
  currentImageIndex = parseInt(index);
  updateViewer();
  document.getElementById('imageViewerModal').style.display = 'flex';
}

window.prevImage = function() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateViewer();
  }
}

window.nextImage = function() {
  if (currentImageIndex < viewerImages.length - 1) {
    currentImageIndex++;
    updateViewer();
  }
}

function updateViewer() {
  document.getElementById('viewerImage').src = viewerImages[currentImageIndex];
  document.getElementById('imageCounter').innerText = `${currentImageIndex + 1} / ${viewerImages.length}`;
}

// ==========================================
// AUTOMATIC IMAGE COMPRESSION HELPER
// ==========================================
function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', quality);
      };
    };
  });
}

async function handlePostAd(e) {
  e.preventDefault();
  if (!requireWallet()) return;
  if (!checkRateLimit('postAd', 10000)) { await showNeonPopup('Slow Down', 'Please wait before posting another ad.', 'OK'); return; }
  if (!supabase) { await showNeonPopup('Offline', 'Database not available.', 'OK'); return; }

  const titleV = validateTitle(document.getElementById('title').value);
  if (!titleV.valid) { await showNeonPopup('Invalid Title', titleV.error, 'OK'); return; }
  const descV = validateDescription(document.getElementById('description').value);
  if (!descV.valid) { await showNeonPopup('Invalid Description', descV.error, 'OK'); return; }
  const addrV = validateAddress(document.getElementById('adAddress').value);
  if (!addrV.valid) { await showNeonPopup('Location Required', 'Please click 📍 Detect GPS to capture your location!', 'OK'); return; }
  const priceV = validatePrice(document.getElementById('price').value);
  if (!priceV.valid) { await showNeonPopup('Invalid Price', priceV.error, 'OK'); return; }

  if (containsPhoneNumber(titleV.clean) || containsPhoneNumber(descV.clean) || containsPhoneNumber(addrV.clean)) {
    await showNeonPopup('Rule Violation', 'Phone numbers or contact details are not allowed to prevent scams!', 'OK'); return;
  }
  const restrictedWord = validateListingContent(titleV.clean, descV.clean);
  if (restrictedWord) {
    await showNeonPopup('Prohibited Item', `Contains restricted keyword ("${escapeHtml(restrictedWord)}").`, 'OK'); return;
  }
  if (/https?:\/\//i.test(descV.clean) || /www\./i.test(descV.clean)) {
    await showNeonPopup('Rule Violation', 'External links in descriptions are not allowed to prevent phishing!', 'OK'); return;
  }

  const fileInput = document.getElementById('imageInput');
  const files = fileInput.files;
  if (files.length === 0) { await showNeonPopup('Image Missing', 'Please select at least one product image!', 'OK'); return; }
  if (files.length > 4) { await showNeonPopup('Limit Reached', 'Max 4 photos allowed!', 'OK'); return; }
  for (let f of files) { if (f.size > 5 * 1024 * 1024) { await showNeonPopup('File Too Large', 'Each image must be under 5MB.', 'OK'); return; } }

  if (!checkWorldAppEnvironment()) { return; }
  let paymentSuccessful = false;
  const paymentRef = randomAlphaNumeric(16);
  try {
    // MiniKit is imported from CDN
    // Tokens/tokenToDecimals from World App globals or fallback to hardcoded values
    // 1 WLD = 1e18 wei (1000000000000000000)
    const WLD_SYMBOL = (Tokens && Tokens.WLD) || 'WLD';
    const WLD_TO_DEC = tokenToDecimals;
    const tokenAmount = WLD_TO_DEC ? WLD_TO_DEC(1, WLD_SYMBOL).toString() : '1000000000000000000';
    console.log(`[PAY] Sending ${tokenAmount} ${WLD_SYMBOL} to ${ADMIN_WALLET}`);
    const { finalPayload } = await MiniKit.commandsAsync.pay({
      reference: paymentRef, to: ADMIN_WALLET,
      tokens: [{ symbol: WLD_SYMBOL, token_amount: tokenAmount }],
      description: 'Listing Fee: 1 WLD',
    });
    paymentSuccessful = (finalPayload?.status === 'success');
    if (paymentSuccessful) console.log(`[PAYMENT OK] ref=${paymentRef} wallet=${userWallet}`);
  } catch (err) { console.error('[PAYMENT FAILED]', err); }

  if (!paymentSuccessful) { await showNeonPopup('Payment Cancelled', 'Payment failed or was cancelled.', 'OK'); return; }

  let imageUrls = ['', '', '', ''];
  for (let i = 0; i < files.length; i++) {
    try {
      const cf = await compressImage(files[i]);
      const fn = `${Date.now()}_${randomAlphaNumeric(8)}.jpg`;
      const { error: ue } = await supabase.storage.from('listing').upload(fn, cf);
      if (ue) { await showNeonPopup('Upload Error', 'Image upload failed. Try again.', 'OK'); return; }
      const { data: pd } = supabase.storage.from('listing').getPublicUrl(fn);
      imageUrls[i] = pd.publicUrl;
    } catch (imgErr) { await showNeonPopup('Image Error', imgErr.message || 'Process failed.', 'OK'); return; }
  }

  // Build insert payload
  const listingPayload = {
    seller_address: userWallet, seller_name: currentUsername,
    title: titleV.clean, description: descV.clean, price: priceV.clean,
    category: document.getElementById('category').value,
    country: document.getElementById('adCountry').value, address: addrV.clean,
    lat: currentLat, lng: currentLng,
    image1: imageUrls[0], image2: imageUrls[1], image3: imageUrls[2], image4: imageUrls[3],
    status: 'active'
  };
  let { error: insertError } = await supabase.from('listings').insert([listingPayload]);
  // If insert failed (possibly missing condition/price_type columns), retry without them
  if (insertError && insertError.message && (insertError.message.includes('condition') || insertError.message.includes('price_type') || insertError.message.includes('column'))) {
    delete listingPayload.condition;
    delete listingPayload.price_type;
    const retry = await supabase.from('listings').insert([listingPayload]);
    insertError = retry.error;
  }

  if (!insertError) {
    // SECURITY: Check for duplicate SOW credit — only 1 SOW per unique ad
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recentAds } = await supabase.from('listings')
      .select('id')
      .eq('seller_address', userWallet)
      .eq('title', titleV.clean)
      .gte('created_at', twoMinAgo);
    const duplicateCount = (recentAds || []).length;
    if (duplicateCount <= 1) {
      // First ad with this title — credit SOW
      const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
      let newBal = (balData && balData.balance) ? balData.balance + 1 : 1;
      await supabase.from('sow_balances').upsert([{ wallet_address: userWallet, balance: newBal }]);
      updateSowBadge();
      await showNeonPopup('Success', `Ad posted successfully!<br><span style="color: var(--success); font-weight: 800; font-size: 1.2rem; display: block; margin-top: 8px;">+1 SOW Coin Earned!</span>`, 'OK');
    } else {
      // Duplicate detected — no extra SOW
      console.log('[SOW] Duplicate ad detected, no extra SOW credited');
      await showNeonPopup('Ad Posted', 'Your ad is now live.', 'OK');
    }
    document.getElementById('adForm').reset();
    window.switchTab('screenHome');
  } else { console.error('[DB ERROR]', insertError); await showNeonPopup('Error', 'Could not save your ad. Try again.', 'OK'); }
}

async function fetchListings() {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  if (!supabase) { container.innerHTML = '<p class="loading-placeholder">Database not available. Check your connection.</p>'; return; }
  const selectedCountry = document.getElementById('countryFilter').value;
  const selectedCategory = document.getElementById('categoryFilter').value;
  const maxDistance = parseInt(document.getElementById('distanceRange').value);
  const searchInput = document.getElementById('searchInput');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  let query = supabase.from('listings').select('*').eq('status', 'active');
  
  if (selectedCountry !== 'ALL') query = query.eq('country', selectedCountry);
  if (selectedCategory !== 'ALL') query = query.eq('category', selectedCategory);

  let data, error;
  try {
    const result = await query;
    data = result.data;
    error = result.error;
  } catch (netErr) {
    container.innerHTML = `<p class="loading-placeholder">\u26a0\ufe0f Network error. Please check your connection and try again.</p>`;
    return;
  }
  
  container.innerHTML = showSkeleton(4);

  if (error || !data || data.length === 0) {
    container.innerHTML = `<p class="loading-placeholder">No active listings found.</p>`;
    return;
  }

  const filteredData = data.filter((item) => {
    const itemLat = item.lat || 28.6139;
    const itemLng = item.lng || 77.2090;
    const realDist = calculateDistance(currentLat, currentLng, itemLat, itemLng);

    item.calculatedDistance = realDist; 

    if (realDist > maxDistance) return false;
    if (searchText && !item.title.toLowerCase().includes(searchText)) return false;
    return true;
  });

  if (filteredData.length === 0) {
    container.innerHTML = `<p class="loading-placeholder">No listings found within ${maxDistance} km of your location.</p>`;
    return;
  }

  container.innerHTML = filteredData.map((item) => {
    const thumbImg = (item.image1 && item.image1.startsWith('http')) ? escapeAttr(item.image1) : 'https://via.placeholder.com/90';
    const dName = escapeHtml(item.seller_name || 'User');
    const iTitle = escapeHtml(item.title);
    const iCountry = escapeHtml(item.country);
    const iPrice = escapeHtml(item.price);
    const iId = escapeAttr(item.id);
    const iSeller = escapeAttr(item.seller_address);
    const cBadge = getConditionBadge(item.condition);
    const pBadge = getPriceTypeBadge(item.price_type);
    const posted = timeAgo(item.created_at);
    return `
      <div class="listing-card" onclick="window.openAdDetails('${iId}')">
        <div class="card-inner">
          <img src="${thumbImg}" class="card-thumb" alt="listing">
          <div class="card-info">
            <div class="card-badges">
              <span class="badge badge-${cBadge.cls}">${cBadge.text}</span>
              <span class="badge badge-${pBadge.cls}">${pBadge.text}</span>
            </div>
            <h3 class="card-title">${iTitle}</h3>
            <p class="card-price">${iPrice} WLD</p>
            <div class="card-meta">
              <span class="card-seller">${dName} - ${iCountry}</span>
              <span class="card-time">${posted}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button onclick="event.stopPropagation(); window.openChat('${iSeller}', '${escapeAttr(item.title)}', '${escapeAttr(item.seller_name || 'User')}')" class="btn-chat-seller">Chat Seller</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openAdDetails = async function(id) {
  const cleanId = String(id).replace(/[^a-zA-Z0-9\-]/g, '');
  const { data, error } = await supabase.from('listings').select('*').eq('id', cleanId).single();
  if (error || !data) { await showNeonPopup('Not Found', 'Ad not found or removed.', 'OK'); return; }
  if (data.status === 'deleted') { await showNeonPopup('Removed', 'This ad has been removed by the seller.', 'OK'); return; }
  const allImages = [data.image1, data.image2, data.image3, data.image4].filter(img => img && img.trim() !== "" && (img.startsWith('http://') || img.startsWith('https://')));
  const imagesUrlsJoined = allImages.join('|');
  const imagesHtml = allImages.map((img, index) => `<img src="${escapeAttr(img)}" onclick="window.openImageViewer('${escapeAttr(imagesUrlsJoined)}', ${index})" class="detail-img" alt="product">`).join('');
  const dName = escapeHtml(data.seller_name || 'User');
  const sAddr = data.seller_address;
  const cBadge = getConditionBadge(data.condition);
  const pBadge = getPriceTypeBadge(data.price_type);
  const posted = timeAgo(data.created_at);
  const dist = data.calculatedDistance ? ` (~${escapeHtml(data.calculatedDistance)} km)` : '';
  document.getElementById('adDetailsBody').innerHTML = `
    <div>
      <div class="detail-meta">
        <span class="badge badge-category">${escapeHtml(data.category)}</span>
        <span class="card-time">${posted}</span>
      </div>
      <h2 class="detail-title">${escapeHtml(data.title)}</h2>
      <div class="detail-meta">
        <span class="badge badge-${cBadge.cls}">${cBadge.text}</span>
        <span class="badge badge-${pBadge.cls}">${pBadge.text}</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px;">
        <h3 class="detail-price">${escapeHtml(data.price)} WLD</h3>
        <span class="card-seller">${escapeHtml(data.country)}${dist}</span>
      </div>
      <div class="detail-section">📍 <b>Location:</b> ${escapeHtml(data.address || 'Not specified')}</div>
      <div class="detail-seller-bar">
        <div>
          <span class="detail-seller-label">Seller</span>
          <h4 class="detail-seller-name">${dName}</h4>
        </div>
        <button class="btn-mark-sold" style="background:#f59e0b;color:#fff;border:none;" onclick="window.openReviews('${escapeAttr(sAddr)}', '${escapeAttr(data.seller_name || 'User')}')">Reviews</button>
      </div>
      <div class="detail-seller-bar" style="color:var(--text);">
        <span class="detail-seller-label">Username</span>
        <p style="margin:2px 0 0;">${escapeHtml(data.seller_name || 'User')}</p>
      </div>
      <hr style="border:0;border-top:1px solid var(--border);margin:14px 0;">
      <h4 class="detail-section-title">Photos (${allImages.length}) - Tap to Zoom</h4>
      <div style="max-height:280px;overflow-y:auto;margin-bottom:14px;">${imagesHtml}</div>
      <h4 class="detail-section-title">Description</h4>
      <p class="detail-section" style="white-space:pre-wrap;line-height:1.5;margin-bottom:16px;">${escapeHtml(data.description)}</p>
      <div class="detail-action-bar">
        <button class="btn-chat-seller" style="background:var(--surface);color:var(--text);border:1px solid var(--border);" onclick="document.getElementById('adDetailsModal').style.display='none';">Back</button>
        <button class="btn-chat-seller" onclick="window.openChat('${escapeAttr(sAddr)}', '${escapeAttr(data.title)}', '${escapeAttr(data.seller_name || 'User')}'); document.getElementById('adDetailsModal').style.display='none';">Chat with Seller</button>
      </div>
    </div>`;
  
  document.getElementById('adDetailsModal').style.display = 'flex';
  document.querySelector('#adDetailsModal .modal-content').style.animation = 'slideInUp 0.35s ease';
}

// ==========================================
// CHAT SYSTEM (XSS-Safe + Anti-Self)
// ==========================================
window.openChat = async function(sellerWallet, adTitle, sellerName) {
  if (!requireWallet()) return;
  if (sellerWallet === userWallet) { await showNeonPopup('Notice', 'You cannot chat with yourself!', 'OK'); return; }
  currentChatSeller = sellerWallet;
  window.currentChatAdTitle = adTitle;    document.getElementById('chatTitle').innerText = `Chat with ${sellerName || getDisplayName(sellerWallet)}`;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML = `<p class="loading-placeholder">Loading chat...</p>`;
  document.getElementById('chatModal').style.display = 'flex';
  document.querySelector('#chatModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const { data, error } = await supabase.from('chats').select('*').order('created_at', { ascending: true });
  if (!data) return;
  let chatHtml = `<div class="chat-msg system">Hello! I am interested in: ${escapeHtml(adTitle)}</div>`;
  if (data && data.length > 0) {
    data.filter(m => m.ad_title === adTitle && ((m.sender === userWallet && m.receiver === sellerWallet) || (m.sender === sellerWallet && m.receiver === userWallet)))
      .forEach(msg => {
        const safe = escapeHtml(msg.message);
        if (msg.sender === userWallet) {
          chatHtml += `<div class="chat-msg sent">${safe}</div>`;
        } else {
          chatHtml += `<div class="chat-msg received">${safe}</div>`;
        }
      });
  }
  chatBox.innerHTML = chatHtml;
  chatBox.scrollTop = chatBox.scrollHeight;
};

window.sendMessage = async function() {
  const input = document.getElementById('chatInput');
  const rawMsg = input.value;
  const msgV = validateChatMsg(rawMsg);
  if (!msgV.valid) { await showNeonPopup('Invalid', msgV.error, 'OK'); return; }
  if (!checkRateLimit('chat', 1000)) { await showNeonPopup('Slow Down', 'Sending too fast.', 'OK'); return; }
  if (!currentChatSeller || !window.currentChatAdTitle) return;
  const msg = msgV.clean;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML += `<div class="chat-msg sent">${escapeHtml(msg)}</div>`;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
  const { error } = await supabase.from('chats').insert([{ sender: userWallet, receiver: currentChatSeller, ad_title: window.currentChatAdTitle, message: msg }]);
  if (error) console.error('[CHAT ERROR]', error);
};

// ==========================================
// REVIEWS (Anti-Fraud + XSS-Safe)
// ==========================================
window.openReviews = async function(sellerAddress, sellerName) {
  document.getElementById('reviewsModalTitle').innerText = `${sellerName}'s Ratings & Reviews`;
  document.getElementById('reviewsModal').style.display = 'flex';
  document.querySelector('#reviewsModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  window.targetSellerAddress = sellerAddress;
  const container = document.getElementById('reviewsListContainer');
  container.innerHTML = `<p class="loading-placeholder">Loading reviews...</p>`;
  const { data: reviews, error } = await supabase.from('reviews').select('*').eq('seller_address', sellerAddress).order('created_at', { ascending: false });
  if (error || !reviews || reviews.length === 0) { container.innerHTML = `<p class="loading-placeholder">No reviews yet.</p>`; return; }
  container.innerHTML = reviews.map(r => {
    const bName = escapeHtml(r.buyer_name);
    const comment = escapeHtml(r.comment || 'No comment provided.');
    const rating = Math.min(5, Math.max(1, parseInt(r.rating) || 5));
    return `<div class="review-item">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span class="detail-seller-name">${bName}</span>
        <span style="color:var(--warning); font-size:0.85rem; font-weight:700;">${rating}/5</span>
      </div>
      <p style="margin:0;font-size:0.85rem;color:var(--text-secondary);">${comment}</p>
    </div>`;
  }).join('');
};

window.submitReview = async function() {
  if (!requireWallet()) return;
  if (!checkRateLimit('review', 5000)) { await showNeonPopup('Slow Down', 'Please wait before another review.', 'OK'); return; }
  if (userWallet === window.targetSellerAddress) { await showNeonPopup('Not Allowed', 'You cannot review yourself! ', 'OK'); return; }
  const rating = parseInt(document.getElementById('reviewRating').value);
  if (rating < 1 || rating > 5) { await showNeonPopup('Invalid Rating', 'Rating must be 1-5.', 'OK'); return; }
  const commentRaw = document.getElementById('reviewComment').value.trim();
  if (commentRaw.length > MAX_REVIEW_LEN) { await showNeonPopup('Too Long', `Review max ${MAX_REVIEW_LEN} chars.`, 'OK'); return; }
  if (containsPhoneNumber(commentRaw) || /https?:\/\//i.test(commentRaw)) { await showNeonPopup('Rule Violation', 'No phone numbers or links in reviews!', 'OK'); return; }
  const comment = commentRaw || '';
  const { data: ex } = await supabase.from('reviews').select('id').eq('seller_address', window.targetSellerAddress).eq('buyer_address', userWallet).single();
  if (ex) { await showNeonPopup('Already Reviewed', 'One review per buyer per seller.', 'OK'); return; }
  const { error } = await supabase.from('reviews').insert([{ seller_address: window.targetSellerAddress, buyer_address: userWallet, buyer_name: currentUsername, rating, comment }]);
  if (!error) { document.getElementById('reviewComment').value = ''; await showNeonPopup('Success', 'Review submitted!', 'OK'); window.openReviews(window.targetSellerAddress, 'Seller'); }
  else { console.error('[REVIEW ERROR]', error); await showNeonPopup('Error', 'Could not submit review.', 'OK'); }
};

// ==========================================
// FEATURE 4: ADMIN PANEL DASHBOARD
// ==========================================
window.openAdminPanel = async function() {
  if (!userWallet || userWallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    await showNeonPopup('Unauthorized', 'Access denied. Admin only.', 'OK');
    return;
  }

  document.getElementById('adminModal').style.display = 'flex';
  document.querySelector('#adminModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const statsContainer = document.getElementById('adminStatsContainer');
  const listingsContainer = document.getElementById('adminListingsContainer');

  statsContainer.innerHTML = `<p class="loading-placeholder">Loading stats...</p>`;
  listingsContainer.innerHTML = showSkeleton(3);

  const { count: totalListings } = await supabase.from('listings').select('*', { count: 'exact', head: true }).neq('status', 'deleted');
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: totalChats } = await supabase.from('chats').select('*', { count: 'exact', head: true });

  statsContainer.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
      <div class="detail-section"><b style="font-size:1.2rem;font-weight:800;display:block;color:var(--accent-indigo);">${totalListings || 0}</b><span class="sow-stats-label">Active Ads</span></div>
      <div class="detail-section"><b style="font-size:1.2rem;font-weight:800;display:block;color:var(--success);">${totalUsers || 0}</b><span class="sow-stats-label">Users</span></div>
      <div class="detail-section"><b style="font-size:1.2rem;font-weight:800;display:block;color:var(--warning);">${totalChats || 0}</b><span class="sow-stats-label">Messages</span></div>
    </div>
  `;

  const { data: listings } = await supabase.from('listings').select('*').neq('status', 'deleted').order('created_at', { ascending: false });

  if (!listings || listings.length === 0) {
    listingsContainer.innerHTML = `<p class="loading-placeholder">No listings found.</p>`;
    return;
  }

  listingsContainer.innerHTML = listings.map(item => {
    const sT = escapeHtml(item.title), sN = escapeHtml(item.seller_name), sP = escapeHtml(item.price), sI = escapeAttr(item.id);
    return `<div class="my-ad-item">
      <div><h4 class="my-ad-title">${sT}</h4><p class="my-ad-price" style="margin:2px 0 0;">By: ${sN} | ${sP} WLD</p></div>
      <button onclick="window.adminDeleteAd('${sI}')" class="btn-mark-sold" style="background:#ef4444; color:#fff;">Force Delete</button>
    </div>`;
  }).join('');
}

window.adminDeleteAd = async function(id) {
  const confirmDel = await window.showNeonPopup('Admin Action', 'Are you sure you want to force delete this ad?', 'OK', 'confirm');
  if (confirmDel) {
    // Try RPC function first (bypasses RLS)
    let deleted = false;
    try {
      const { data: rpcResult } = await supabase.rpc('delete_ad', { p_ad_id: id, p_wallet: ADMIN_WALLET });
      if (rpcResult && rpcResult.success) deleted = true;
    } catch (e) {}

    // Also try mark_ad_sold RPC if delete_ad is not available
    if (!deleted) {
      try {
        const { data: rpcResult } = await supabase.rpc('mark_ad_sold', { p_ad_id: id, p_wallet: ADMIN_WALLET });
        if (rpcResult && rpcResult.success) deleted = true;
      } catch (e) {}
    }

    // Fallback: direct delete (may be blocked by RLS)
    if (!deleted) {
      const { data: adData } = await supabase.from('listings').select('title, image1, image2, image3, image4').eq('id', id).single();
      if (adData) {
        const imagesList = [adData.image1, adData.image2, adData.image3, adData.image4];
        for (const imgUrl of imagesList) {
          if (imgUrl && imgUrl.includes('/listing/')) {
            const filePath = imgUrl.split('/listing/')[1];
            if (filePath) await supabase.storage.from('listing').remove([filePath]);
          }
        }
      }
      try {
        await supabase.from('listings').delete().match({ id });
        deleted = true;
      } catch (e) {}
    }

    if (deleted) {
      await showNeonPopup('Success', 'Ad deleted by admin.', 'OK');
    } else {
      await showNeonPopup('Info', 'Could not delete directly. Run SUPABASE_SQL_DELETE.sql in your dashboard.', 'OK');
    }
    window.openAdminPanel();
    fetchListings();
  }
}

window.openMyAdsScreen = async function() {
  if (!userWallet) {
    document.getElementById('myAdsContainer').innerHTML = '<p class="loading-placeholder">Please connect wallet first.</p>';
    document.getElementById('myAdsBalanceCard').innerHTML = '';
    return;
  }
  const container = document.getElementById('myAdsContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;

  // Balance card (compact, no emoji per Worldcoin guidelines)
  const balanceHtml = `<div class="sow-stats-inner"><div class="sow-stats-left"><span class="sow-stats-icon">SOW</span><div><p class="sow-stats-label">SOW Balance</p><p class="sow-stats-value">${earnedSow}</p></div></div><button onclick="window.openLeaderboard()" class="sow-stats-lead-btn">Rankings</button></div>`;
  document.getElementById('myAdsBalanceCard').innerHTML = balanceHtml;

  // Fetch all ads for this user
  const { data: allMyAds } = await supabase.from('listings')
    .select('*')
    .eq('seller_address', userWallet)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  const activeAds = (allMyAds || []).filter(a => a.status === 'active');
  const soldAds = (allMyAds || []).filter(a => a.status === 'sold');

  let html = '';
  if (activeAds.length > 0) {
    html += `<p class="my-ads-section-title">Active (${activeAds.length})</p>`;
    html += activeAds.map(item => {
      const sI = escapeAttr(item.id), sT = escapeHtml(item.title), sP = escapeHtml(item.price), sC = escapeHtml(item.country);
      return `<div onclick="window.openAdDetails('${sI}')" class="my-ad-item">
        <div><h4 class="my-ad-title">${sT}</h4><p class="my-ad-price">${sP} WLD (${sC})</p></div>
        <div class="my-ad-actions-row">
          <button onclick="event.stopPropagation(); window.markAsSoldOut('${sI}')" class="btn-mark-sold">Mark Sold</button>
          <button onclick="event.stopPropagation(); window.deleteMyAd('${sI}')" class="btn-delete-ad">Delete</button>
        </div>
      </div>`;
    }).join('');
  }
  if (soldAds.length > 0) {
    html += `<p class="my-ads-section-title">Sold (${soldAds.length})</p>`;
    html += soldAds.map(item => {
      const sI = escapeAttr(item.id), sT = escapeHtml(item.title), sP = escapeHtml(item.price), sC = escapeHtml(item.country);
      return `<div onclick="window.openAdDetails('${sI}')" class="my-ad-item sold">
        <div><h4 class="my-ad-title" style="text-decoration:line-through;">${sT}</h4><p class="my-ad-price" style="color:var(--text-muted);">${sP} WLD (${sC})</p></div>
        <span class="btn-sold-done">Sold</span>
      </div>`;
    }).join('');
  }
  if (!html) html = '<p class="loading-placeholder">No ads yet. Post your first ad!</p>';
  container.innerHTML = html;
}

// ==========================================
// DELETE AD — soft delete (status='deleted')
// SOW coins are NEVER affected by deletion
// ==========================================
window.deleteMyAd = async function(id) {
  if (!userWallet) { await showNeonPopup('Error', 'Please connect your wallet first.', 'OK'); return; }
  if (!checkRateLimit('deleteAd', 3000)) { await showNeonPopup('Slow Down', 'Please wait a moment.', 'OK'); return; }

  const isConfirmed = await showNeonPopup('Delete Ad?', 'This ad will be permanently removed. Your SOW coins are safe and will not be affected.', 'OK', 'confirm');
  if (!isConfirmed) return;

  // SECURITY: Verify ownership
  const { data: adData, error: fetchErr } = await supabase.from('listings').select('seller_address, status').eq('id', id).single();
  if (fetchErr || !adData) {
    await showNeonPopup('Error', 'Ad not found.', 'OK');
    return;
  }
  if (adData.seller_address.toLowerCase() !== userWallet.toLowerCase()) {
    await showNeonPopup('Unauthorized', 'You can only delete your own ads.', 'OK');
    return;
  }
  if (adData.status === 'deleted') {
    await showNeonPopup('Info', 'This ad is already deleted.', 'OK');
    window.openMyAdsScreen();
    return;
  }

  // Try RPC function first (bypasses RLS), fall back to direct update
  let deleteOk = false;
  try {
    const { data: rpcResult } = await supabase.rpc('delete_ad', {
      p_ad_id: id,
      p_wallet: userWallet
    });
    if (rpcResult && rpcResult.success) {
      deleteOk = true;
    }
  } catch (rpcErr) {
    console.log('[DELETE] RPC not available, trying direct:', rpcErr.message);
  }

  // Fallback: direct update
  if (!deleteOk) {
    try {
      const { data: updateData, error: updateErr } = await supabase.from('listings').update({ status: 'deleted' }).eq('id', id).eq('seller_address', userWallet).select('id, status');
      if (!updateErr && updateData && updateData.length > 0) deleteOk = true;
    } catch (e) {}
  }

  // Verify the delete took effect
  if (deleteOk) {
    const { data: verifyData } = await supabase.from('listings').select('status').eq('id', id).single();
    if (verifyData && verifyData.status === 'deleted') {
      await showNeonPopup('Deleted', 'Ad removed. Your SOW coins are safe!', 'OK');
      window.openMyAdsScreen();
      fetchListings();
      return;
    }
  }

  await showNeonPopup('Delete Failed', 'Could not delete ad. Please run the SQL fix in your Supabase dashboard (see SUPABASE_SQL_DELETE.sql).', 'OK');
}

window.markAsSoldOut = async function(id) {
  if (!userWallet) { await showNeonPopup('Error', 'Please connect your wallet first.', 'OK'); return; }
  if (!checkRateLimit('soldOut', 3000)) { await showNeonPopup('Slow Down', 'Please wait a moment.', 'OK'); return; }
  const isConfirmed = await showNeonPopup('Mark as Sold?', 'This ad will be marked as sold. Your SOW coins will stay!', 'OK', 'confirm');
  if (isConfirmed) {
    // SECURITY: Verify ownership — only the ad's seller can mark it sold
    const { data: adData, error: fetchErr } = await supabase.from('listings').select('seller_address, status').eq('id', id).single();
    if (fetchErr || !adData) {
      console.error('[SOLD] Ad fetch failed:', fetchErr);
      await showNeonPopup('Error', 'Ad not found. Please refresh.', 'OK');
      return;
    }
    if (adData.seller_address.toLowerCase() !== userWallet.toLowerCase()) {
      await showNeonPopup('Unauthorized', 'You can only mark your own ads as sold.', 'OK');
      return;
    }
    if (adData.status === 'sold') {
      await showNeonPopup('Already Sold', 'This ad is already marked as sold.', 'OK');
      window.openMyAdsScreen();
      return;
    }
    // Try RPC function first (bypasses RLS), fall back to direct update
    let soldOk = false;
    try {
      const { data: rpcResult } = await supabase.rpc('mark_ad_sold', {
        p_ad_id: id,
        p_wallet: userWallet
      });
      console.log('[SOLD] RPC result:', rpcResult);
      if (rpcResult && rpcResult.success) {
        soldOk = true;
      }
    } catch (rpcErr) {
      console.log('[SOLD] RPC not available, trying direct update:', rpcErr.message);
    }

    // Fallback: direct update (may be blocked by RLS)
    if (!soldOk) {
      const { data: updateData, error: updateErr } = await supabase.from('listings').update({ status: 'sold' }).eq('id', id).select('id, status');
      console.log('[SOLD] Direct update result:', { updateData, updateErr });
      if (!updateErr && updateData && updateData.length > 0) {
        soldOk = true;
      }
    }

    // Verify the update actually took effect
    if (soldOk) {
      const { data: verifyData } = await supabase.from('listings').select('status').eq('id', id).single();
      if (verifyData && verifyData.status === 'sold') {
        await showNeonPopup('Sold', 'Ad marked as sold. Your SOW coins are safe!', 'OK');
        window.openMyAdsScreen();
        fetchListings();
        return;
      }
    }
    // If we get here, something failed
    await showNeonPopup('Update Failed', 'Could not mark as sold. Please run the SQL fix in your Supabase dashboard (see SUPABASE_SQL_FIX.sql).', 'OK');
    console.error('[SOLD] All methods failed for ad:', id);
  }
}

window.openLeaderboard = async function() {
  document.getElementById('leaderboardModal').style.display = 'flex';
  document.querySelector('#leaderboardModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const container = document.getElementById('leaderboardContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balances, error: balError } = await supabase.from('sow_balances').select('*').order('balance', { ascending: false }).limit(50);
  if (balError || !balances || balances.length === 0) {
    container.innerHTML = `<p class="loading-placeholder">No data yet. Be the first to earn SOW! 🚀</p>`;
    return;
  }

  const wallets = balances.map(b => b.wallet_address);
  const { data: usersData } = await supabase.from('users').select('*').in('wallet_address', wallets);
  const userMap = {};
  if (usersData) { usersData.forEach(u => { userMap[u.wallet_address] = u.username; }); }

  container.innerHTML = balances.map((item, index) => {
    const isTop3 = index < 3;
    const rankLabels = ['1st', '2nd', '3rd'];
    const username = escapeHtml(userMap[item.wallet_address] || 'Unknown User');
    const bal = escapeHtml(item.balance);
    const rankText = isTop3 ? rankLabels[index] : '#' + (index + 1);

    return `<div class="${isTop3 ? 'lb-item top-3' : 'lb-item'}">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="lb-rank">${rankText}</span>
        <div>
          <h4 class="lb-name">${username}</h4>
          <p class="lb-username">${escapeHtml(userMap[item.wallet_address] || '')}</p>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="lb-balance">${bal}</div>
        <div class="lb-balance-label">SOW</div>
      </div>
    </div>`;
  }).join('');;
}

// ==========================================
// PROFILE SCREEN
// =========================================
// UPDATE SOW BALANCE BADGE IN HEADER
async function updateSowBadge() {
  if (!userWallet) return;
  try {
    const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
    const sow = balData ? balData.balance : 0;
    const statsCard = document.getElementById('sowStatsCard');
    const homeCount = document.getElementById('homeSowCount');
    if (statsCard) statsCard.style.display = 'block';
    if (homeCount) homeCount.textContent = sow;
  } catch(e) {}
}

window.renderProfile = async function() {
  const container = document.getElementById('profileContainer');
  if (!userWallet || !currentUsername) {
    container.innerHTML = '<div class="text-center py-20 color-muted"><p style="font-size:1.5rem;margin-bottom:8px;">🔐</p><p style="font-size:1rem; margin-bottom:6px; font-weight:700;">Wallet Not Connected</p><p style="font-size:0.85rem;">Connect your wallet to access your profile</p></div>';
    return;
  }
  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;
  const isAdmin = userWallet.toLowerCase() === ADMIN_WALLET.toLowerCase();
  container.innerHTML = `
    <div class="profile-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <p class="profile-label">Profile</p>
          <h3 class="profile-name">${escapeHtml(currentUsername)}</h3>
        </div>
        <span class="sow-stats-icon">SOW</span>
      </div>
      <div class="profile-balance-section">
        <p class="profile-label">SOW Balance</p>
        <p class="sow-stats-value">${earnedSow}</p>
      </div>
    </div>
    <div class="profile-actions">
      <button onclick="window.openLeaderboard()" class="btn-profile-action btn-leaderboard">View Leaderboard</button>
      <a href="mailto:airdrophubgroup@gmail.com" class="btn-profile-action btn-support">Support</a>
      ${isAdmin ? '<button onclick="window.openAdminPanel()" class="btn-profile-action btn-admin">Admin Panel</button>' : ''}
    </div>
  `;
};