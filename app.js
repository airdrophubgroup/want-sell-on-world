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
let currentChatSellerName = null;
let currentLat = 28.6139; 
let currentLng = 77.2090;

// ==========================================
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
const addressBook = {};
async function resolveUsername(addr) {
  if (!addr) return 'Unknown';
  if (addressBook[addr]) return addressBook[addr];
  const { data } = await supabase.from('users').select('username').eq('wallet_address', addr).single();
  if (data && data.username) { addressBook[addr] = data.username; return data.username; }
  const { data: lst } = await supabase.from('listings').select('seller_name').eq('seller_address', addr).limit(1).single();
  if (lst && lst.seller_name) { addressBook[addr] = lst.seller_name; return lst.seller_name; }
  addressBook[addr] = addr.substring(0, 8) + '...';
  return addressBook[addr];
}
function getDisplayName(addr) { return addressBook[addr] || (addr ? addr.substring(0, 8) + '...' : 'Unknown'); }

// ==========================================
// TAB NAVIGATION
// =========================================
window.switchTab = function(screenId) {
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
    html += '<div class="skeleton skeleton-card" style="display:flex; gap:12px; padding:12px; align-items:center;"><div class="skeleton skeleton-thumb"></div><div style="flex:1;"><div class="skeleton skeleton-text" style="width:70%;"></div><div class="skeleton skeleton-text" style="width:50%;"></div><div class="skeleton skeleton-text-sm"></div></div></div>';
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
      if (!userWallet) { showNeonPopup('Hold On', 'Connect wallet first!', ''); return; }
      window.switchTab('screenPost');
    });
  }

  const detBtn = document.getElementById('detectLocationBtn');
  if (detBtn) detBtn.addEventListener('click', () => window.detectLocation());

  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    const shell = document.getElementById('appShell');
    const fab = document.getElementById('fabPost');
    if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.5s'; setTimeout(() => splash.style.display = 'none', 500); }
    if (shell) shell.style.display = 'flex';
    if (fab) fab.style.display = 'flex';
  }, 2000);
}

// ==========================================
// UNIVERSAL NEON POPUP SYSTEM
// ==========================================
let popupResolve = null;
window.showNeonPopup = function(title, text, icon = '🔔', type = 'alert') {
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
      popupBox.style.borderColor = '#ef4444';
      popupBox.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.4)';
      document.getElementById('neonPopupTitle').style.color = '#ef4444';
    } else if (type === 'prompt') {
      inputContainer.style.display = 'block';
      document.getElementById('neonPopupInput').value = '';
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'Submit';
      popupBox.style.borderColor = '#10b981';
      popupBox.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.4)';
      document.getElementById('neonPopupTitle').style.color = '#10b981';
    } else {
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'OK';
      popupBox.style.borderColor = '#38bdf8';
      popupBox.style.boxShadow = '0 0 30px rgba(56, 189, 248, 0.4)';
      document.getElementById('neonPopupTitle').style.color = '#38bdf8';
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
    await showNeonPopup('Copied!', 'Wallet Address copied to clipboard.', '📋');
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = address;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      await showNeonPopup('Copied!', 'Wallet Address copied to clipboard.', '📋');
    } catch (ex) {}
    document.body.removeChild(textArea);
  }
}

// ==========================================
// STRICT WORLD APP ENVIRONMENT CHECK
// ==========================================
async function enforceWorldAppEnvironment() {
  const isWorldApp = (typeof MiniKit !== 'undefined' && MiniKit.isInstalled());
  if (!isWorldApp) {
    document.body.innerHTML = `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; font-family: sans-serif;">
        <div style="font-size: 80px; margin-bottom: 20px; animation: iconBounce 2s infinite;">⚠️</div>
        <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 10px; font-weight: 900; text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);">STRICT WARNING</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem; max-width: 400px; line-height: 1.6; margin-bottom: 30px;">
          This application is secure and can <b>ONLY</b> be opened inside the official <b>World App</b>. Please open this mini-app through World App to continue.
        </p>
        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; padding: 12px 24px; border-radius: 14px; color: #ef4444; font-weight: bold; font-size: 0.95rem; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);">
          🚫 Access Denied Outside World App
        </div>
      </div>
    `;
    return false;
  }
  return true;
}

function waitForMiniKitReady(timeoutMs = 2000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (typeof MiniKit !== 'undefined' && MiniKit.isInstalled()) {
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 100);
      }
    })();
  });
}

function randomAlphaNumeric(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

function generatePaymentHash(wallet, amount, reference) {
  const data = `${wallet}:${amount}:${reference}:${APP_ID}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash = hash & hash; }
  return Math.abs(hash).toString(16);
}

document.addEventListener('DOMContentLoaded', async () => {
  try { MiniKit.install(APP_ID); } catch (e) { console.error(e); }
  await waitForMiniKitReady();
  
  const isAllowed = await enforceWorldAppEnvironment();
  if (!isAllowed) return;    setupUI();
  initApp();
  detectUserCurrentPosition();
  fetchListings();
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
}

async function handleLogin() {
  if (!checkRateLimit('login', 5000)) { await showNeonPopup('Slow Down', 'Please wait a few seconds.', '⏳'); return; }
  try {
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce: randomAlphaNumeric(24),
      requestId: 'req_login_' + Date.now(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 60 * 1000),
      statement: 'Sign in to WantSell',
    });
    if (finalPayload?.status === 'success' && finalPayload?.address) {
      userWallet = finalPayload.address;
      const { data: userData } = await supabase.from('users').select('username').eq('wallet_address', userWallet).single();
      if (userData && userData.username) {
        currentUsername = userData.username;
      } else {
        let usernameInput = await showNeonPopup('Welcome! 👋', 'Choose a Username (2-20 chars, letters/numbers only):', '👤', 'prompt');
        let attempts = 0;
        while (attempts < 3) {
          const v = validateUsername(usernameInput);
          if (v.valid) { currentUsername = v.clean; break; }
          attempts++;
          if (attempts >= 3) { currentUsername = 'User_' + Math.floor(Math.random() * 10000); await showNeonPopup('Auto Username', `Using: ${currentUsername}`, '👤'); break; }
          usernameInput = await showNeonPopup('Invalid Username', v.error, '⚠️', 'prompt');
        }
        const { data: exUser } = await supabase.from('users').select('wallet_address').eq('wallet_address', userWallet).single();
        if (!exUser) { await supabase.from('users').upsert([{ wallet_address: userWallet, username: currentUsername }]); }
      }
      document.getElementById('loginBtn').innerText = `${currentUsername}`;
      if (userWallet.toLowerCase() === ADMIN_WALLET.toLowerCase()) { const ab = document.getElementById('adminPanelBtn'); if (ab) ab.style.display = 'block'; }
    } else {
      await showNeonPopup('Connection Failed', 'Wallet connect nahi ho paaya.', '🔌');
    }
  } catch (err) {
    console.error('Login error:', err);
    await showNeonPopup('Error', 'Wallet connect error. Try again.', '❌');
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
          await showNeonPopup('Notice', 'Could not auto-detect. Please type manually.', '📍');
        }
      } catch (err) {
        addressField.value = "";
        await showNeonPopup('Error', 'Location permissions denied and fallback failed. Please type manually.', '🌍');
      }
    }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
  } else {
    addressField.value = "";
    await showNeonPopup('Error', 'Geolocation not supported. Please type manually.', '🚫');
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
    'new': { text: '✨ Brand New', bg: '#dcfce7', color: '#166534' },
    'like_new': { text: '🌟 Like New', bg: '#dbeafe', color: '#1e40af' },
    'good': { text: '👍 Good', bg: '#fef3c7', color: '#92400e' },
    'fair': { text: '👌 Fair', bg: '#f3e8ff', color: '#6b21a8' },
    'used': { text: '📦 Used', bg: '#f1f5f9', color: '#475569' }
  };
  return map[cond] || map['used'];
}

function getPriceTypeBadge(pt) {
  if (pt === 'negotiable') return { text: '💬 Negotiable', bg: '#e0e7ff', color: '#4338ca' };
  return { text: '🔒 Fixed Price', bg: '#fce7f3', color: '#be185d' };
}

// ==========================================
// PROHIBITED / ILLEGAL WORDS CHECKER
// ==========================================
const forbiddenWords = ['weapon', 'drug', 'gun', 'hack', 'counterfeit', 'illegal', 'adult', 'bomb', 'firearm', 'steal', 'scam', 'phishing', 'crack', 'exploit', 'cheat', 'fraud', 'narcotics', 'meth', 'cocaine', 'bomb'];

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
  if (!checkRateLimit('postAd', 10000)) { await showNeonPopup('Slow Down', 'Please wait before posting another ad.', '⏳'); return; }
  if (!userWallet || !currentUsername) { await showNeonPopup('Hold On', 'Please connect your wallet first!', '🔗'); return; }

  const titleV = validateTitle(document.getElementById('title').value);
  if (!titleV.valid) { await showNeonPopup('Invalid Title', titleV.error, '📝'); return; }
  const descV = validateDescription(document.getElementById('description').value);
  if (!descV.valid) { await showNeonPopup('Invalid Description', descV.error, '📝'); return; }
  const addrV = validateAddress(document.getElementById('adAddress').value);
  if (!addrV.valid) { await showNeonPopup('Location Required', 'Please click 📍 Detect GPS to capture your location!', '📍'); return; }
  const priceV = validatePrice(document.getElementById('price').value);
  if (!priceV.valid) { await showNeonPopup('Invalid Price', priceV.error, '💰'); return; }

  if (containsPhoneNumber(titleV.clean) || containsPhoneNumber(descV.clean) || containsPhoneNumber(addrV.clean)) {
    await showNeonPopup('Rule Violation', 'Phone numbers or contact details are not allowed to prevent scams!', '🚫'); return;
  }
  const restrictedWord = validateListingContent(titleV.clean, descV.clean);
  if (restrictedWord) {
    await showNeonPopup('Prohibited Item', `Contains restricted keyword ("${escapeHtml(restrictedWord)}").`, '🛡️'); return;
  }
  if (/https?:\/\//i.test(descV.clean) || /www\./i.test(descV.clean)) {
    await showNeonPopup('Rule Violation', 'External links in descriptions are not allowed to prevent phishing!', '🚫'); return;
  }

  const fileInput = document.getElementById('imageInput');
  const files = fileInput.files;
  if (files.length === 0) { await showNeonPopup('Image Missing', 'Please select at least one product image!', '🖼️'); return; }
  if (files.length > 4) { await showNeonPopup('Limit Reached', 'Max 4 photos allowed!', '📸'); return; }

  let paymentSuccessful = false;
  const paymentRef = randomAlphaNumeric(16);
  try {
    const { finalPayload } = await MiniKit.commandsAsync.pay({
      reference: paymentRef, to: ADMIN_WALLET,
      tokens: [{ symbol: Tokens.WLD, token_amount: tokenToDecimals(1, Tokens.WLD).toString() }],
      description: 'Listing Fee: 1 WLD',
    });
    paymentSuccessful = (finalPayload?.status === 'success');
    if (paymentSuccessful) console.log(`[PAYMENT OK] ref=${paymentRef} wallet=${userWallet}`);
  } catch (err) { console.error('[PAYMENT FAILED]', err); }

  if (!paymentSuccessful) { await showNeonPopup('Payment Cancelled', 'Payment failed or was cancelled.', '💸'); return; }

  let imageUrls = ['', '', '', ''];
  for (let i = 0; i < files.length; i++) {
    try {
      const cf = await compressImage(files[i]);
      const fn = `${Date.now()}_${randomAlphaNumeric(8)}.jpg`;
      const { error: ue } = await supabase.storage.from('listing').upload(fn, cf);
      if (ue) { await showNeonPopup('Upload Error', 'Upload failed: ' + ue.message, '❌'); return; }
      const { data: pd } = supabase.storage.from('listing').getPublicUrl(fn);
      imageUrls[i] = pd.publicUrl;
    } catch (imgErr) { await showNeonPopup('Image Error', imgErr.message || 'Process failed.', '❌'); return; }
  }

  const { error: insertError } = await supabase.from('listings').insert([{
    seller_address: userWallet, seller_name: currentUsername,
    title: titleV.clean, description: descV.clean, price: priceV.clean,
    category: document.getElementById('category').value,
    country: document.getElementById('adCountry').value, address: addrV.clean,
    condition: document.getElementById('adCondition').value,
    price_type: document.getElementById('priceType').value,
    lat: currentLat, lng: currentLng,
    image1: imageUrls[0], image2: imageUrls[1], image3: imageUrls[2], image4: imageUrls[3],
    status: 'active'
  }]);

  if (!insertError) {
    const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
    let newBal = (balData && balData.balance) ? balData.balance + 1 : 1;
    await supabase.from('sow_balances').upsert([{ wallet_address: userWallet, balance: newBal }]);
    document.getElementById('adModal').style.display = 'none';
    document.getElementById('adForm').reset(); fetchListings();
    await showNeonPopup('Awesome! 🎉', `Ad posted successfully!<br><span style="color: #10b981; font-weight: 800; font-size: 1.2rem; display: block; margin-top: 8px;">+1 SOW Coin Earned!</span>`, '🪙');
  } else { console.error('[DB ERROR]', insertError); await showNeonPopup('Database Error', 'Error saving ad. Try again.', '⚠️'); }
}

async function fetchListings() {
  const container = document.getElementById('listingsContainer');
  const selectedCountry = document.getElementById('countryFilter').value;
  const selectedCategory = document.getElementById('categoryFilter').value;
  const maxDistance = parseInt(document.getElementById('distanceRange').value);
  const searchInput = document.getElementById('searchInput');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  let query = supabase.from('listings').select('*').eq('status', 'active');
  
  if (selectedCountry !== 'ALL') query = query.eq('country', selectedCountry);
  if (selectedCategory !== 'ALL') query = query.eq('category', selectedCategory);

  const { data, error } = await query;
  
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
      <div class="listing-card" onclick="window.openAdDetails('${iId}')" style="cursor:pointer; background:#fff; padding:12px; border-radius:14px; border:1px solid #e2e8f0; margin-bottom:10px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${thumbImg}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 10px;" alt="listing">
          <div style="flex:1;">
            <div style="display:flex; gap:6px; align-items:center; margin-bottom:4px;">
              <span style="background:${cBadge.bg}; color:${cBadge.color}; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:600;">${cBadge.text}</span>
              <span style="background:${pBadge.bg}; color:${pBadge.color}; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:600;">${pBadge.text}</span>
            </div>
            <h3 style="font-size:1.05rem; margin:4px 0; color:#1e293b;">${iTitle}</h3>
            <p style="font-size:1.05rem; font-weight:800; color:#10b981; margin:0;">${iPrice} WLD</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              <span style="font-size:0.75rem; color:#64748b;">👤 ${dName} · 🌍 ${iCountry}</span>
              <span style="font-size:0.7rem; color:#94a3b8;">${posted}</span>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:6px; margin-top:8px; border-top:1px solid #f1f5f9; padding-top:8px;">
          <button onclick="event.stopPropagation(); window.openChat('${iSeller}', '${escapeAttr(item.title)}', '${escapeAttr(item.seller_name || 'User')}')" style="background:#4f46e5; color:#fff; flex:1; padding:8px; font-size:12px; border-radius:8px; border:none; cursor:pointer; font-weight:bold;">💬 Chat Seller</button>
          <button onclick="event.stopPropagation(); window.copyAddress('${iSeller}')" style="background:#f1f5f9; color:#475569; padding:8px 12px; font-size:12px; border-radius:8px; border:none; cursor:pointer; font-weight:600;">📋 Copy ID</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openAdDetails = async function(id) {
  const cleanId = String(id).replace(/[^a-zA-Z0-9\-]/g, '');
  const { data, error } = await supabase.from('listings').select('*').eq('id', cleanId).single();
  if (error || !data) { await showNeonPopup('Not Found', 'Ad not found or removed.', '🔍'); return; }
  const allImages = [data.image1, data.image2, data.image3, data.image4].filter(img => img && img.trim() !== "" && (img.startsWith('http://') || img.startsWith('https://')));
  const imagesUrlsJoined = allImages.join('|');
  const imagesHtml = allImages.map((img, index) => `<img src="${escapeAttr(img)}" onclick="window.openImageViewer('${escapeAttr(imagesUrlsJoined)}', ${index})" style="width:100%; height:240px; object-fit:contain; background:#0f172a; border-radius:10px; margin-bottom:8px; border:1px solid #e2e8f0; cursor:zoom-in;" alt="product">`).join('');
  const dName = escapeHtml(data.seller_name || 'User');
  const sAddr = data.seller_address;
  const cBadge = getConditionBadge(data.condition);
  const pBadge = getPriceTypeBadge(data.price_type);
  const posted = timeAgo(data.created_at);
  const shortAddr = escapeHtml(sAddr.substring(0,18));
  const dist = data.calculatedDistance ? ` (~${escapeHtml(data.calculatedDistance)} km)` : '';
  document.getElementById('adDetailsBody').innerHTML = `
    <div style="text-align:left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold;">📂 ${escapeHtml(data.category)}</span>
        <span style="font-size:11px; color:#94a3b8;">${posted}</span>
      </div>
      <h2 style="font-size:1.4rem; margin:6px 0; color:#1e293b;">${escapeHtml(data.title)}</h2>
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
        <span style="background:${cBadge.bg}; color:${cBadge.color}; padding:4px 10px; border-radius:14px; font-size:11px; font-weight:600;">${cBadge.text}</span>
        <span style="background:${pBadge.bg}; color:${pBadge.color}; padding:4px 10px; border-radius:14px; font-size:11px; font-weight:600;">${pBadge.text}</span>
      </div>
      <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:14px;">
        <h3 style="font-size:1.6rem; color:#10b981; margin:0;">${escapeHtml(data.price)} WLD</h3>
        <span style="font-size:0.8rem; color:#64748b;">🌍 ${escapeHtml(data.country)}${dist}</span>
      </div>
      <div style="background:#f1f5f9; padding:10px 12px; border-radius:8px; font-size:12px; color:#475569; margin-bottom:10px;">📍 <b>Location:</b> ${escapeHtml(data.address || 'Not specified')}</div>
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b); padding:12px; border-radius:12px; margin-bottom:14px; color:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:11px; color:#94a3b8;">Seller</span>
            <h4 style="margin:2px 0; color:#38bdf8;">${dName}</h4>
          </div>
          <button onclick="window.openReviews('${escapeAttr(sAddr)}', '${escapeAttr(data.seller_name || 'User')}')" style="background:#f59e0b; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:bold; cursor:pointer;">⭐ Reviews</button>
        </div>
        <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
          <span style="font-size:10px; color:#94a3b8;">Username</span>
          <p onclick="window.copyAddress('${escapeAttr(sAddr)}')" style="margin:2px 0 0 0; font-family:monospace; color:#cbd5e1; font-size:11px; cursor:pointer;">${shortAddr}... 📋 Tap to copy</p>
        </div>
      </div>
      <hr style="border:0; border-top:1px solid #e2e8f0; margin-bottom:14px;">
      <h4 style="font-size:0.95rem; color:#475569; margin-bottom:6px;">📸 Photos (${allImages.length}) - Tap to Zoom</h4>
      <div style="max-height:280px; overflow-y:auto; margin-bottom:14px; padding-right:4px;">${imagesHtml}</div>
      <h4 style="font-size:0.95rem; color:#475569; margin-bottom:6px;">📝 Description</h4>
      <p style="font-size:0.95rem; color:#334155; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:16px; white-space:pre-wrap; line-height:1.4;">${escapeHtml(data.description)}</p>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button onclick="document.getElementById('adDetailsModal').style.display='none';" style="background: #e2e8f0; color: #475569; flex: 1; padding: 12px; border: none; border-radius: 10px; font-size: 1rem; font-weight: bold; cursor: pointer;">⬅️ Back</button>
        <button onclick="window.openChat('${escapeAttr(sAddr)}', '${escapeAttr(data.title)}', '${escapeAttr(data.seller_name || 'User')}'); document.getElementById('adDetailsModal').style.display='none';" style="background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; flex: 1.5; padding: 12px; border: none; border-radius: 10px; font-size: 1rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(79,70,229,0.3);">💬 Chat with Seller</button>
      </div>
    </div>`;
  document.getElementById('adDetailsModal').style.display = 'flex';
  document.querySelector('#adDetailsModal .modal-content').style.animation = 'slideInUp 0.35s ease';
}

// ==========================================
// CHAT SYSTEM (XSS-Safe + Anti-Self)
// ==========================================
window.openChat = async function(sellerWallet, adTitle, sellerName) {
  if (!userWallet || !currentUsername) { await showNeonPopup('Hold On', 'Please connect wallet first!', '💬'); return; }
  if (sellerWallet === userWallet) { await showNeonPopup('Notice', 'You cannot chat with yourself!', 'ℹ️'); return; }
  currentChatSeller = sellerWallet;
  currentChatSellerName = sellerName;
  window.currentChatAdTitle = adTitle;    document.getElementById('chatTitle').innerText = `Chat with ${sellerName || getDisplayName(sellerWallet)}`;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML = `<p class="loading-placeholder">Loading chat...</p>`;
  document.getElementById('chatModal').style.display = 'flex';
  document.querySelector('#chatModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const { data, error } = await supabase.from('chats').select('*').eq('ad_title', adTitle).order('created_at', { ascending: true });
  let chatHtml = `<div style="background:#e2e8f0; padding:8px 12px; border-radius:8px; font-size:12px; align-self:flex-start; color:#334155; margin-bottom:4px;">Hello! I am interested in: ${escapeHtml(adTitle)}</div>`;
  if (data && data.length > 0) {
    data.filter(m => (m.sender === userWallet && m.receiver === sellerWallet) || (m.sender === sellerWallet && m.receiver === userWallet))
      .forEach(msg => {
        const safe = escapeHtml(msg.message);
        if (msg.sender === userWallet) {
          chatHtml += `<div style="background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; font-size:12px; align-self:flex-end; max-width:80%; margin-bottom:4px;">${safe}</div>`;
        } else {
          chatHtml += `<div style="background:#e2e8f0; padding:8px 12px; border-radius:8px; font-size:12px; align-self:flex-start; color:#334155; max-width:80%; margin-bottom:4px;">${safe}</div>`;
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
  if (!msgV.valid) { await showNeonPopup('Invalid', msgV.error, '⚠️'); return; }
  if (!checkRateLimit('chat', 1000)) { await showNeonPopup('Slow Down', 'Sending too fast.', '⏳'); return; }
  if (!currentChatSeller || !window.currentChatAdTitle) return;
  const msg = msgV.clean;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML += `<div style="background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; font-size:12px; align-self:flex-end; max-width:80%; margin-bottom:4px;">${escapeHtml(msg)}</div>`;
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
  if (error || !reviews || reviews.length === 0) { container.innerHTML = `<p style="text-align:center; color:#64748b; font-size:0.9rem;">No reviews yet. Be the first!</p>`; return; }
  container.innerHTML = reviews.map(r => {
    const bName = escapeHtml(r.buyer_name);
    const comment = escapeHtml(r.comment || 'No comment provided.');
    const rating = Math.min(5, Math.max(1, parseInt(r.rating) || 5));
    return `<div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-weight:bold; font-size:0.85rem; color:#1e293b;">${bName}</span>
        <span style="color:#f59e0b; font-size:0.85rem;">${'⭐'.repeat(rating)}</span>
      </div>
      <p style="margin:0; font-size:0.85rem; color:#475569;">${comment}</p>
    </div>`;
  }).join('');
};

window.submitReview = async function() {
  if (!checkRateLimit('review', 5000)) { await showNeonPopup('Slow Down', 'Please wait before another review.', '⏳'); return; }
  if (!userWallet || !currentUsername) { await showNeonPopup('Hold On', 'Please connect wallet first!', '⭐'); return; }
  if (userWallet === window.targetSellerAddress) { await showNeonPopup('Not Allowed', 'You cannot review yourself! 🚫', '❌'); return; }
  const rating = parseInt(document.getElementById('reviewRating').value);
  if (rating < 1 || rating > 5) { await showNeonPopup('Invalid Rating', 'Rating must be 1-5.', '⚠️'); return; }
  const commentRaw = document.getElementById('reviewComment').value.trim();
  if (commentRaw.length > MAX_REVIEW_LEN) { await showNeonPopup('Too Long', `Review max ${MAX_REVIEW_LEN} chars.`, '⚠️'); return; }
  if (containsPhoneNumber(commentRaw) || /https?:\/\//i.test(commentRaw)) { await showNeonPopup('Rule Violation', 'No phone numbers or links in reviews!', '🚫'); return; }
  const comment = commentRaw || '';
  const { data: ex } = await supabase.from('reviews').select('id').eq('seller_address', window.targetSellerAddress).eq('buyer_address', userWallet).single();
  if (ex) { await showNeonPopup('Already Reviewed', 'One review per buyer per seller.', 'ℹ️'); return; }
  const { error } = await supabase.from('reviews').insert([{ seller_address: window.targetSellerAddress, buyer_address: userWallet, buyer_name: currentUsername, rating, comment }]);
  if (!error) { document.getElementById('reviewComment').value = ''; await showNeonPopup('Success', 'Review submitted!', '🎉'); window.openReviews(window.targetSellerAddress, 'Seller'); }
  else { console.error('[REVIEW ERROR]', error); await showNeonPopup('Error', 'Could not submit review.', '⚠️'); }
};

// ==========================================
// FEATURE 4: ADMIN PANEL DASHBOARD
// ==========================================
window.openAdminPanel = async function() {
  if (!userWallet || userWallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    await showNeonPopup('Unauthorized', 'Access denied. Admin only.', '🚫');
    return;
  }

  document.getElementById('adminModal').style.display = 'flex';
  document.querySelector('#adminModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const statsContainer = document.getElementById('adminStatsContainer');
  const listingsContainer = document.getElementById('adminListingsContainer');

  statsContainer.innerHTML = `<p class="loading-placeholder">Loading stats...</p>`;
  listingsContainer.innerHTML = showSkeleton(3);

  const { count: totalListings } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: totalChats } = await supabase.from('chats').select('*', { count: 'exact', head: true });

  statsContainer.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; text-align:center;">
      <div style="background:#e0e7ff; padding:10px; border-radius:8px;"><b style="color:#4f46e5; font-size:1.1rem; display:block;">${totalListings || 0}</b> Active Ads</div>
      <div style="background:#d1fae5; padding:10px; border-radius:8px;"><b style="color:#10b981; font-size:1.1rem; display:block;">${totalUsers || 0}</b> Users</div>
      <div style="background:#fef3c7; padding:10px; border-radius:8px;"><b style="color:#d97706; font-size:1.1rem; display:block;">${totalChats || 0}</b> Messages</div>
    </div>
  `;

  const { data: listings } = await supabase.from('listings').select('*').order('created_at', { ascending: false });

  if (!listings || listings.length === 0) {
    listingsContainer.innerHTML = `<p style="text-align:center; color:#64748b;">No listings found.</p>`;
    return;
  }

  listingsContainer.innerHTML = listings.map(item => {
    const sT = escapeHtml(item.title), sN = escapeHtml(item.seller_name), sP = escapeHtml(item.price), sI = escapeAttr(item.id);
    return `<div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div><h4 style="margin:0; font-size:0.9rem; color:#1e293b;">${sT}</h4><p style="margin:2px 0 0 0; font-size:0.75rem; color:#64748b;">By: ${sN} | ${sP} WLD</p></div>
      <button onclick="window.adminDeleteAd('${sI}')" style="background:#ef4444; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">Force Delete</button>
    </div>`;
  }).join('');
}

window.adminDeleteAd = async function(id) {
  const confirmDel = await window.showNeonPopup('Admin Action', 'Are you sure you want to force delete this ad?', '🛡️', 'confirm');
  if (confirmDel) {
    const { data: adData } = await supabase.from('listings').select('title, image1, image2, image3, image4').eq('id', id).single();
    if (adData) {
      const imagesList = [adData.image1, adData.image2, adData.image3, adData.image4];
      for (const imgUrl of imagesList) {
        if (imgUrl && imgUrl.includes('/listing/')) {
          const filePath = imgUrl.split('/listing/')[1];
          if (filePath) await supabase.storage.from('listing').remove([filePath]);
        }
      }
      await supabase.from('chats').delete().eq('ad_title', adData.title);
    }
    await supabase.from('listings').delete().match({ id });
    await showNeonPopup('Success', 'Ad force deleted by admin.', '✅');
    window.openAdminPanel();
    fetchListings();
  }
}

window.openMyAdsScreen = async function() {
  if (!userWallet) {
    const container = document.getElementById('myAdsContainer');
    container.innerHTML = '<p style="text-align:center; color:#64748b; padding:30px;">Please connect wallet first.</p>';
    document.getElementById('myAdsBalanceCard').innerHTML = '';
    return;
  }
  
  const container = document.getElementById('myAdsContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;

  const balanceHtml = `<div class="balance-card"><h3 style="color:#38bdf8; margin-bottom:6px;">Your Balance</h3><p style="font-size:1.5rem; font-weight:800; color:#fff;">${earnedSow} SOW</p><p style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Keep posting to earn more!</p></div>`;

  const { data: activeAds } = await supabase.from('listings').select('*').eq('seller_address', userWallet).eq('status', 'active');

  if (!activeAds || activeAds.length === 0) {
    container.innerHTML = balanceHtml + `<p style="text-align:center; color:#64748b; padding:20px;">You have no active ads.</p>`;
    return;
  }

  document.getElementById('myAdsBalanceCard').innerHTML = balanceHtml;
  container.innerHTML = activeAds.map(item => {
    const sI = escapeAttr(item.id), sT = escapeHtml(item.title), sP = escapeHtml(item.price), sC = escapeHtml(item.country);
    return `<div onclick="window.openAdDetails('${sI}')" style="background:rgba(0,0,0,0.03); padding:10px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
      <div><h4 style="font-size:0.9rem; color:#1e293b;">${sT}</h4><p style="font-size:0.8rem; color:#10b981;">${sP} WLD (${sC})</p></div>
      <button onclick="event.stopPropagation(); window.markAsSoldOut('${sI}')" style="background:#ef4444; color:#fff; padding:6px 10px; font-size:11px; border-radius:6px; font-weight:bold; cursor:pointer;">Delete</button>
    </div>`;
  }).join('');
}

window.markAsSoldOut = async function(id) {
  const isConfirmed = await showNeonPopup('Delete Ad?', 'Are you sure this item is Sold Out? This will permanently delete the ad, its images, and chat history.', '🗑️', 'confirm');
  
  if (isConfirmed) {
    const { data: adData } = await supabase.from('listings').select('title, image1, image2, image3, image4').eq('id', id).single();

    if (adData) {
      const imagesList = [adData.image1, adData.image2, adData.image3, adData.image4];
      for (const imgUrl of imagesList) {
        if (imgUrl && imgUrl.includes('/listing/')) {
          const filePath = imgUrl.split('/listing/')[1];
          if (filePath) await supabase.storage.from('listing').remove([filePath]);
        }
      }
      await supabase.from('chats').delete().eq('ad_title', adData.title);
    }

    const { error } = await supabase.from('listings').delete().match({ id });
    if (!error) {
      await showNeonPopup('Deleted', 'Ad, storage images, and related chat history deleted successfully!', '✅');
      window.switchTab('screenMyAds');
      fetchListings();
    } else {
      await showNeonPopup('Error', 'Could not delete: ' + error.message, '⚠️');
    }
  }
}

window.openLeaderboard = async function() {
  document.getElementById('leaderboardModal').style.display = 'flex';
  document.querySelector('#leaderboardModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const container = document.getElementById('leaderboardContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balances, error: balError } = await supabase.from('sow_balances').select('*').order('balance', { ascending: false }).limit(50);
  if (balError || !balances || balances.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">No data yet. Be the first to earn SOW! 🚀</p>`;
    return;
  }

  const wallets = balances.map(b => b.wallet_address);
  const { data: usersData } = await supabase.from('users').select('*').in('wallet_address', wallets);
  const userMap = {};
  if (usersData) { usersData.forEach(u => { userMap[u.wallet_address] = u.username; }); }

  container.innerHTML = balances.map((item, index) => {
    let rankMedal = `#${index + 1}`;
    if(index === 0) rankMedal = '🥇 1st';
    if(index === 1) rankMedal = '🥈 2nd';
    if(index === 2) rankMedal = '🥉 3rd';
    
    const username = escapeHtml(userMap[item.wallet_address] || 'Unknown User');
    const shortWallet = escapeHtml(item.wallet_address.substring(0, 6) + '...');
    const bal = escapeHtml(item.balance);

    let specialStyle = index < 3 
      ? 'border: 2px solid #38bdf8; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; box-shadow: 0 4px 10px rgba(56, 189, 248, 0.2);' 
      : 'background: rgba(0,0,0,0.03); border: 1px solid #e2e8f0;';
    let nameStyle = index < 3 ? 'color: #38bdf8;' : 'color: #1e293b;';
    let rankStyle = index < 3 ? 'color: #f59e0b; font-size: 1.1rem;' : 'color: #64748b; font-size: 0.95rem;';

    return `
      <div style="padding:10px 14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; ${specialStyle}">
        <div style="display:flex; align-items:center; gap: 12px;">
          <span style="font-weight: 800; min-width: 45px; ${rankStyle}">${rankMedal}</span>
          <div>
            <h4 style="margin: 0; font-size: 0.95rem; ${nameStyle}">${username}</h4>
            <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: #94a3b8; font-family: monospace;">${shortWallet}</p>
          </div>
        </div>
        <div style="font-weight: bold; font-size: 1rem; color: #10b981; text-align:right;">
          ${bal} <br><span style="font-size:0.7rem; color:#94a3b8;">SOW</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// PROFILE SCREEN
// =========================================
window.renderProfile = async function() {
  const container = document.getElementById('profileContainer');
  if (!userWallet || !currentUsername) {
    container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:#64748b;"><p style="font-size:1.2rem; margin-bottom:10px;">Not logged in</p><p style="font-size:0.85rem;">Tap Connect Wallet to get started</p></div>';
    return;
  }
  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;
  const isAdmin = userWallet.toLowerCase() === ADMIN_WALLET.toLowerCase();
  container.innerHTML = '<div class="balance-card"><h3 style="color:#38bdf8; margin-bottom:6px;">' + escapeHtml(currentUsername) + '</h3><p style="font-size:1.5rem; font-weight:800; color:#fff;">' + earnedSow + ' SOW</p><p style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Keep posting to earn more!</p></div><div style="display:flex; flex-direction:column; gap:10px;"><button onclick="window.openLeaderboard()" style="background:#f59e0b; color:#fff; padding:12px; border:none; border-radius:10px; font-weight:700; font-size:0.9rem; cursor:pointer;">Leaderboard</button><a href="mailto:airdrophubgroup@gmail.com" style="text-align:center; color:#64748b; font-size:0.8rem; padding:8px; text-decoration:none;">Support Email</a>' + (isAdmin ? '<button onclick="window.openAdminPanel()" style="background:rgba(239,68,68,0.1); color:#ef4444; padding:12px; border:1px solid #ef4444; border-radius:10px; font-weight:700; font-size:0.9rem; cursor:pointer;">Admin Panel</button>' : '') + '</div>';
};