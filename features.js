/**
 * BunBabe Premium Features: Twilight Mode & Bouquet Builder
 */

// 🌙 Twilight Mode Logic
function toggleTwilight() {
    document.body.classList.toggle('twilight-mode');
    const isTwilight = document.body.classList.contains('twilight-mode');
    localStorage.setItem('bunbabe_twilight', isTwilight);
    updateTwilightIcon(isTwilight);
}

function updateTwilightIcon(isTwilight) {
    const btn = document.getElementById('twilightBtn');
    if (btn) {
        btn.innerText = isTwilight ? '☀️' : '🌙';
    }
}

function initTwilight() {
    const saved = localStorage.getItem('bunbabe_twilight');
    if (saved === 'true') {
        document.body.classList.add('twilight-mode');
        updateTwilightIcon(true);
    }
}

// 🌸 Bouquet Builder Logic
let currentBouquet = [];

function addToBouquet(emoji) {
    if (currentBouquet.length >= 12) {
        alert("Your bouquet is full! 🌸");
        return;
    }
    
    currentBouquet.push(emoji);
    renderBouquet();
}

function renderBouquet() {
    const canvas = document.getElementById('builderCanvas');
    if (!canvas) return;
    
    canvas.innerHTML = '';
    currentBouquet.forEach((emoji, index) => {
        const span = document.createElement('span');
        span.innerText = emoji;
        span.style.position = 'absolute';
        span.style.fontSize = '3rem';
        span.style.cursor = 'move';
        
        // Random placement within canvas
        const x = Math.random() * (canvas.offsetWidth - 60);
        const y = Math.random() * (canvas.offsetHeight - 60);
        
        span.style.left = x + 'px';
        span.style.top = y + 'px';
        span.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        
        span.onclick = () => removeFromBouquet(index);
        canvas.appendChild(span);
    });
}

function removeFromBouquet(index) {
    currentBouquet.splice(index, 1);
    renderBouquet();
}

function clearBouquet() {
    currentBouquet = [];
    renderBouquet();
}

// ─── Theme Engine ──────────────────────────────
async function initSiteTheme() {
    const theme = localStorage.getItem('bb_site_theme') || 'default';
    applyThemeToBody(theme);
}

function applyThemeToBody(theme) {
    document.body.classList.remove('theme-winter', 'theme-summer', 'theme-autumn', 'theme-galaxy');
    if (theme && theme !== 'default') {
        document.body.classList.add('theme-' + theme);
    }
}

// 🌸 Floating Decorations Logic
function initDecorations() {
  const container = document.createElement('div');
  container.id = 'decorations-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const theme = localStorage.getItem('bb_site_theme') || 'default';
  const themeIcons = {
      default: ['🌸', '🌼', '🌷', '🌿', '✨', '🎀', '🧶'],
      winter:  ['❄️', '⛄', '🧤', '🏂', '🏔️', '🦌', '☕'],
      summer:  ['☀️', '🍦', '⛱️', '🐬', '🍉', '🌊', '🌴'],
      autumn:  ['🍂', '🍁', '🍄', '🪵', '🦊', '🥧', '☕'],
      galaxy:  ['✨', '🪐', '☄️', '🌌', '🛸', '🛰️', '🔭']
  };
  const icons = themeIcons[theme] || themeIcons.default;
  const count = 20;

  for (let i = 0; i < count; i++) {
    const dec = document.createElement('div');
    dec.innerText = icons[Math.floor(Math.random() * icons.length)];
    dec.className = 'floating-decoration';
    
    dec.style.left = Math.random() * 95 + 'vw';
    dec.style.top = Math.random() * 95 + 'vh';
    dec.style.animationDuration = (Math.random() * 3 + 4) + 's';
    dec.style.animationDelay = (Math.random() * 5) + 's';
    dec.style.opacity = Math.random() * 0.3 + 0.1;
    dec.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
    
    container.appendChild(dec);
  }
}

// 👑 BunBabe + Membership Engine
const PLUS_KEY = 'bunbabe_plus_active';

function isPlusActive() {
    const legacy = localStorage.getItem(PLUS_KEY) === 'true';
    const session = JSON.parse(localStorage.getItem('bb_session') || 'null');
    const hasMembership = session && (session.membership === 'gold' || session.membership === 'vip');
    return legacy || hasMembership;
}

function activatePlus() {
    if (confirm("✨ Ready to upgrade to BunBabe +? \n\nUnlock 100+ Features including:\n- Exclusive Gold Inventory\n- Executive Music Player\n- Priority Crafting Drops\n- Mood-Based Site Themes\n- Personal Antigravity Stylist")) {
        localStorage.setItem(PLUS_KEY, 'true');
        
        // Sync with session if logged in
        const session = JSON.parse(localStorage.getItem('bb_session') || 'null');
        if (session) {
            session.membership = 'vip'; // Default to VIP for direct plus activations
            session.memberBadge = '👑 VIP Elite';
            session.memberDiscount = 20;
            localStorage.setItem('bb_session', JSON.stringify(session));
        }

        alert("💎 Welcome to the Elite. BunBabe + Activated!");
        location.reload();
    }
}

// 🎵 Plus Exclusive: Music Player
function initPlusMusic() {
    if (!isPlusActive()) return;

    const player = document.createElement('div');
    player.className = 'plus-music-player';
    player.innerHTML = `
        <div class="music-info">✨ Playing: BunBabe Lo-Fi</div>
        <div class="music-controls">
            <button onclick="togglePlay()"><span id="playIcon">⏸️</span></button>
        </div>
    `;
    document.body.appendChild(player);
}

let isPlaying = true;
function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('playIcon').innerText = isPlaying ? '⏸️' : '▶️';
    // Audio logic would go here if we had mp3 files
}

//* 🧶 YARN BANK LOYALTY SYSTEM */
function getYarnPoints() {
    const session = JSON.parse(localStorage.getItem('bb_session') || '{}');
    return session.yarnPoints || 0;
}

function addYarnPoints(amt) {
    const session = JSON.parse(localStorage.getItem('bb_session') || '{}');
    session.yarnPoints = (session.yarnPoints || 0) + amt;
    localStorage.setItem('bb_session', JSON.stringify(session));
    showToast(`🧶 +${amt} Yarn Scraps added!`);
}

function unveilMysteryBox() {
    const overlay = document.createElement('div');
    overlay.className = 'mystery-unveil-overlay';
    overlay.innerHTML = `
        <div class="mystery-pkg">
            <div class="pkg-box">🎁</div>
            <div class="pkg-glow"></div>
            <h2 id="mystery-title">Your Monthly Mystery is...</h2>
            <div id="mystery-content" style="display:none;">
                <div style="font-size:5rem;">🧶🌸</div>
                <h3>Sakura Bunny Keychain</h3>
                <p>Limited Edition • Executive Plus Only</p>
                <button class="btn" onclick="this.parentElement.parentElement.parentElement.remove()">Claim & Ship 🚚</button>
            </div>
            <button id="pkg-open-btn" class="btn-gold" style="margin-top:2rem;" onclick="processUnveil()">Open Now ✨</button>
        </div>
    `;
    document.body.appendChild(overlay);

    window.processUnveil = () => {
        const btn = document.getElementById('pkg-open-btn');
        const box = document.querySelector('.pkg-box');
        btn.style.display = 'none';
        box.style.animation = 'boxPop 0.5s forwards';
        setTimeout(() => {
            document.getElementById('mystery-content').style.display = 'block';
            document.getElementById('mystery-title').innerText = '🎉 UNLOCKED!';
        }, 600);
    };
}

// 🧩 PLUS ACCESS WRAPPER
function checkPlusRequirement(featureName) {
    if (!isPlusActive()) {
        const overlay = document.createElement('div');
        overlay.style = "position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); padding:2rem;";
        overlay.innerHTML = `
            <div style="background:white; padding:3rem; border-radius:32px; text-align:center; max-width:450px; border:4px solid var(--gold);">
                <div style="font-size:4rem; margin-bottom:1rem;">💎</div>
                <h2 style="font-family:'Pacifico', cursive; color:var(--pink-dark);">Exclusive Member Feature</h2>
                <p style="color:var(--text-light); margin-bottom:2rem;">The <strong>${featureName}</strong> is part of the BunBabe + experience. Upgrade now to unlock 100+ premium boutique features.</p>
                <button class="btn" style="background:var(--gold); color:white; width:100%; border:none;" onclick="window.location.href='membership.html'">Upgrade to Plus ✨</button>
                <button style="background:none; border:none; margin-top:1rem; color:var(--text-light); cursor:pointer;" onclick="this.parentElement.parentElement.remove()">Maybe later</button>
            </div>
        `;
        document.body.appendChild(overlay);
        return false;
    }
    return true;
}

// 🛸 Antigravity Bubble Engine
function initAntigravityBubble() {
    let bubble = document.getElementById('antigravity-bubble');
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.id = 'antigravity-bubble';
        bubble.className = 'antigravity-bubble';
        bubble.innerHTML = '🛸';
        document.body.appendChild(bubble);
    }

    const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
    const plusActive = isPlusActive();

    if (isAdmin) {
        bubble.title = "Admin Hub";
        bubble.onclick = () => window.location.href = 'admin.html';
        bubble.innerHTML = '🛸';
    } else if (plusActive) {
        bubble.title = "Manage Membership";
        bubble.onclick = () => window.location.href = 'auth.html';
        bubble.innerHTML = '👑';
    } else {
        bubble.title = "Upgrade to BunBabe +";
        bubble.onclick = () => window.location.href = 'membership.html';
        bubble.innerHTML = '💎';
    }
}

// ─── Initialize ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = window.location.pathname.includes('admin.html') || sessionStorage.getItem('adminLoggedIn') === 'true';
    const plusActive = isPlusActive();

    initSiteTheme();
    initTwilight();
    initDecorations();
    
    // 👑 PLUS MODE INITIALIZATION
    if (plusActive || isAdmin) {
        document.body.classList.add('plus-mode');
        
        // HIDE ADVERTISEMENTS & LOCKS FOR MEMBERS/ADMINS
        const teaser = document.getElementById('plus-teaser');
        if (teaser) teaser.style.display = 'none';

        const subBanner = document.querySelector('.sub-banner');
        if (subBanner && subBanner.innerHTML.includes('Join Elite')) {
            subBanner.style.display = 'none';
        }

        // Unlock all gated UI
        document.querySelectorAll('.plus-locked, .locked-vip').forEach(el => {
            el.classList.remove('plus-locked', 'locked-vip');
            const overlay = el.querySelector('.plus-overlay, .lock-overlay');
            if (overlay) overlay.remove();
        });

        // Small delay to ensure DOM logos are ready
        setTimeout(updateSiteBrandingToPlus, 50);
    }

    if (plusActive) initPlusMusic();
    initAntigravityBubble();
    
    // Add Twilight Button
    const toggle = document.createElement('div');
    toggle.id = 'twilightBtn';
    toggle.className = 'twilight-toggle';
    toggle.innerText = '🌙';
    toggle.onclick = toggleTwilight;
    document.body.appendChild(toggle);

    // ── Inject Nav Auth Badge ──
    const nav = document.querySelector('nav');
    if (nav) {
        const session = JSON.parse(localStorage.getItem('bb_session') || 'null');
        const authEl  = document.createElement('a');
        authEl.href   = 'auth.html';
        authEl.style.cssText = 'display:flex; align-items:center; gap:0.4rem; text-decoration:none; background:var(--pink-light); color:var(--pink-dark); padding:0.35rem 0.8rem; border-radius:50px; font-weight:800; font-size:0.85rem; transition:all 0.2s;';
        if (session) {
            const av = session.avatar || '🐰';
            authEl.innerHTML = `<span>${av}</span><span>${session.firstName}</span>`;
        } else {
            authEl.innerHTML = `<span>👤</span><span>Sign In</span>`;
        }
        const cart = nav.querySelector('.nav-cart');
        if (cart) nav.insertBefore(authEl, cart);
    }
});

function updateSiteBrandingToPlus() {
    // Dynamic logo upgrade
    const logoIcons = document.querySelectorAll('.nav-brand, .logo, .sidebar-brand .brand-name, .brand-name, .nav-logo');
    logoIcons.forEach(el => {
        if (!el.innerHTML.includes('+')) {
            el.innerHTML += ` <span class="plus-sign" style="color:var(--gold); font-family:sans-serif; font-weight:900; margin-left:4px;">+</span>`;
        }
    });

    // Update Hero text if exists
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1 && !heroH1.innerHTML.includes('+')) {
        heroH1.innerHTML += ` <span style="color:var(--gold)">+</span>`;
    }
}

