// Shopping Cart Logic for BunBabe

// ─── Valid Coupon Codes (merged from admin DB + defaults) ───────────────────
let COUPON_CODES = {
    'BBBIG50':    { discount: 50, type: 'percent', label: '50% OFF 🏆',       freeShip: false },
    'BUNBABE30':  { discount: 30, type: 'percent', label: '30% OFF 🎊',       freeShip: false },
    'BUNBABE20':  { discount: 20, type: 'percent', label: '20% OFF 🌸',       freeShip: false },
    'BUNBABE15':  { discount: 15, type: 'percent', label: '15% OFF 🎀',       freeShip: false },
    'BUNBABE10':  { discount: 10, type: 'percent', label: '10% OFF ✨',       freeShip: false },
    'BUNBABE5':   { discount: 5,  type: 'percent', label: '5% OFF 🎁',        freeShip: false },
    'BBFREESHIP': { discount: 0,  type: 'percent', label: 'Free Shipping 📦', freeShip: true  },
    'BBBOGO':     { discount: 50, type: 'percent', label: 'Buy 1 Get 1 👯',   freeShip: false },
    'BBMYSTERY':  { discount: 15, type: 'percent', label: 'Mystery Gift 🎁',  freeShip: true  },
    'WELCOME10':  { discount: 10, type: 'percent', label: 'Welcome 10% 💗',   freeShip: false },
    'BUNBABE':    { discount: 5,  type: 'percent', label: 'Fan Discount 🧶',  freeShip: false },
};

async function syncCoupons() {
    if (window.DATABASE && window.DATABASE.getCoupons) {
        const stored = await window.DATABASE.getCoupons();
        if (stored && Array.isArray(stored)) {
            stored.forEach(c => {
                if (c.active) {
                    COUPON_CODES[c.code] = {
                        discount: c.discount,
                        type: 'percent',
                        label: c.label,
                        freeShip: !!c.freeShip
                    };
                }
            });
        }
    }
}
syncCoupons();

// ─── State ───────────────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('bunbabe_cart')) || [];
let appliedCoupon = JSON.parse(localStorage.getItem('bunbabe_coupon') || 'null');

// ─── Init ────────────────────────────────────────────────────────────────────
async function initCart() {
    await syncCoupons();
    renderCart();
    updateCartIcon();
}

// ─── Add Item ────────────────────────────────────────────────────────────────
function addToCart(name, priceStr, emoji) {
    const price = parseInt(priceStr.replace(/[^\d]/g, ''), 10);
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, emoji, quantity: 1 });
    }
    saveCart();
    renderCart();
    openCart();
    showToast(`Added ${name} to cart! 🛒`);
}

// ─── Remove ──────────────────────────────────────────────────────────────────
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    renderCart();
}

// ─── Quantity ────────────────────────────────────────────────────────────────
function changeQuantity(name, change) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(name);
    } else {
        saveCart();
        renderCart();
    }
}

// ─── Save ────────────────────────────────────────────────────────────────────
function saveCart() {
    localStorage.setItem('bunbabe_cart', JSON.stringify(cart));
    updateCartIcon();
}

// ─── Totals ──────────────────────────────────────────────────────────────────
function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
function getDiscountAmount(subtotal) {
    if (!appliedCoupon || !COUPON_CODES[appliedCoupon]) return 0;
    return Math.round(subtotal * COUPON_CODES[appliedCoupon].discount / 100);
}
function hasFreeShipping() {
    return !!(appliedCoupon && COUPON_CODES[appliedCoupon]?.freeShip);
}
function getCartTotal() {
    const sub = getCartSubtotal();
    return sub - getDiscountAmount(sub);
}

// ─── Nav Icon ────────────────────────────────────────────────────────────────
function updateCartIcon() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// ─── Apply Coupon ────────────────────────────────────────────────────────────
function applyCoupon(code) {
    if (!code) { showToast('Please enter a coupon code! 🎀'); return; }
    const clean = code.trim().toUpperCase();
    if (COUPON_CODES[clean]) {
        appliedCoupon = clean;
        localStorage.setItem('bunbabe_coupon', JSON.stringify(clean));
        renderCart();
        showToast('✅ Coupon applied: ' + COUPON_CODES[clean].label + '!');
    } else {
        showToast('❌ Invalid coupon code. Try again!');
    }
}

function removeCoupon() {
    appliedCoupon = null;
    localStorage.removeItem('bunbabe_coupon');
    renderCart();
    showToast('Coupon removed 🗑️');
}

// ─── Render Cart Drawer ───────────────────────────────────────────────────────
function renderCart() {
    const drawerItems = document.getElementById('cartItems');
    const totalEl     = document.getElementById('cartTotal');
    if (!drawerItems || !totalEl) return;

    if (cart.length === 0) {
        drawerItems.innerHTML = '<p style="text-align:center; margin-top:2rem; color:var(--text-light);">Your cart is empty! 🌸</p><p style="text-align:center;"><a href="spin.html" style="color:var(--pink-dark); font-weight:700;">🎡 Spin for a discount first!</a></p>';
        totalEl.innerText = 'GH₵ 0';
        return;
    }

    const subtotal = getCartSubtotal();
    const discount = getDiscountAmount(subtotal);

    drawerItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-emoji">${item.emoji}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">GH₵ ${item.price}</div>
                <div class="cart-item-controls">
                    <button onclick="changeQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.name}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');

    // Coupon input or applied badge
    const couponHtml = appliedCoupon
        ? `<div style="background:#e6f7ed; border:1.5px solid #a5d6a7; border-radius:10px; padding:0.7rem 1rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
               <span style="font-size:0.85rem; font-weight:800; color:#2e7d32;">✅ ${COUPON_CODES[appliedCoupon].label}</span>
               <button onclick="removeCoupon()" style="background:none; border:none; cursor:pointer; color:#d32f2f; font-weight:800; font-size:0.8rem;">Remove ×</button>
           </div>`
        : `<div style="display:flex; gap:0.5rem; margin-bottom:0.6rem;">
               <input id="couponInput" type="text" placeholder="🎡 Got a coupon code?" style="flex:1; padding:0.5rem 0.8rem; border:1.5px solid var(--pink-light); border-radius:8px; font-family:inherit; font-size:0.85rem; background:var(--cream);" onkeydown="if(event.key==='Enter') applyCoupon(this.value)">
               <button onclick="applyCoupon(document.getElementById('couponInput').value)"
                   style="background:var(--pink-dark); color:white; border:none; border-radius:8px; padding:0.5rem 1rem; font-weight:800; font-size:0.8rem; cursor:pointer;">Apply</button>
           </div>`;

    const savingsRow = discount > 0
        ? `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:0.3rem; color:#2e7d32; font-weight:700;"><span>🎉 Discount</span><span>-GH₵ ${discount}</span></div>`
        : '';
    const freeShipRow = hasFreeShipping()
        ? `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:0.3rem; color:#2e7d32; font-weight:700;"><span>📦 Shipping</span><span>FREE!</span></div>`
        : '';

    drawerItems.insertAdjacentHTML('beforeend', `
        <div style="border-top:2px dashed var(--pink-light); margin-top:1rem; padding-top:1rem;">
            ${couponHtml}
            <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:0.3rem; color:var(--text-light);">
                <span>Subtotal</span><span>GH₵ ${subtotal}</span>
            </div>
            ${savingsRow}
            ${freeShipRow}
        </div>
    `);

    totalEl.innerText = 'GH₵ ' + (subtotal - discount);
}

// ─── Drawer Toggle ───────────────────────────────────────────────────────────
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer.classList.contains('open')) { closeCart(); } else { openCart(); }
}
function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').style.display = 'block';
}
function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').style.display = 'none';
}

// ─── Checkout redirect ───────────────────────────────────────────────────────
function checkout() {
    if (cart.length === 0) { showToast("🛒 Your cart is empty!"); return; }
    
    // Redirect to the checkout page
    window.location.href = 'checkout.html';
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3200);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initCart();
    checkCustomerInbox();
});

// ─── Customer Inbox Notification ──────────────────────────────────────────────
function checkCustomerInbox() {
    let session = JSON.parse(localStorage.getItem('bb_session') || 'null');
    if (!session) return;
    
    let allMessages = JSON.parse(localStorage.getItem('bb_admin_messages') || '[]');
    let userMessages = allMessages.filter(m => m.to.toLowerCase() === session.firstName.toLowerCase() || m.to === 'all');
    let readMessages = JSON.parse(localStorage.getItem('bb_read_messages') || '[]');
    
    // Create a unique ID for each message to track read status
    let unread = userMessages.filter(m => !readMessages.includes(m.date + m.title));
    
    if (unread.length > 0) {
        if (!document.getElementById('floating-inbox')) {
            const btn = document.createElement('a');
            btn.id = 'floating-inbox';
            btn.href = 'profile.html';
            btn.innerHTML = `💌 Inbox <span style="background:#ff4757; color:white; border-radius:50%; padding:2px 6px; font-size:0.75rem; font-weight:bold; margin-left:4px;">${unread.length}</span>`;
            btn.style.cssText = 'position:fixed; bottom:20px; left:20px; background:white; color:#3a2535; border:3px solid #f59fb0; border-radius:50px; padding:0.6rem 1rem; font-family:"Nunito",sans-serif; font-weight:800; font-size:0.9rem; text-decoration:none; box-shadow:0 6px 20px rgba(0,0,0,0.15); z-index:2000; display:flex; align-items:center; animation: inboxBounce 2s infinite;';
            document.body.appendChild(btn);
            
            if (!document.getElementById('inbox-bounce-anim')) {
                const style = document.createElement('style');
                style.id = 'inbox-bounce-anim';
                style.innerHTML = `@keyframes inboxBounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }`;
                document.head.appendChild(style);
            }
        }
    }
}
// ─── THE EPIC SECRET (Do Not Tell The User!) ──────────────────────────────────
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

window.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            triggerEpicMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function triggerEpicMode() {
    // 1. Epic Screen Shake
    document.body.style.animation = 'epicShake 0.5s ease-in-out';
    if(!document.getElementById('epic-styles')) {
        const style = document.createElement('style');
        style.id = 'epic-styles';
        style.innerHTML = `
            @keyframes epicShake {
                0% { transform: translate(10px, 10px) rotate(0deg); filter: hue-rotate(0deg); }
                20% { transform: translate(-10px, -20px) rotate(-2deg); filter: hue-rotate(90deg); }
                40% { transform: translate(-20px, 10px) rotate(2deg); filter: hue-rotate(180deg); }
                60% { transform: translate(20px, 10px) rotate(0deg); filter: hue-rotate(270deg); }
                80% { transform: translate(10px, -10px) rotate(2deg); filter: hue-rotate(360deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); filter: hue-rotate(0deg); }
            }
            @keyframes epicFall {
                0% { transform: translateY(-100px) rotate(0deg) scale(1); }
                100% { transform: translateY(120vh) rotate(720deg) scale(1.5); }
            }
            .epic-text {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                font-family: 'Pacifico', cursive; font-size: 8rem; color: #ffcc00;
                text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff, 0 0 80px #ff00ff;
                z-index: 9999; animation: epicScale 2s forwards; pointer-events: none;
                white-space: nowrap; text-align: center; line-height: 1;
            }
            @keyframes epicScale {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 2. Giant Overlay Text
    const text = document.createElement('div');
    text.className = 'epic-text';
    text.innerHTML = 'EPIC BUNNY<br>MODE!';
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 2000);

    // 3. Rain 100 Crochet Elements
    const emojis = ['🧶', '🐰', '🍓', '🎀', '✨', '🌸', '💖'];
    for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.position = 'fixed';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-50px';
        el.style.fontSize = (Math.random() * 40 + 20) + 'px';
        el.style.zIndex = '9998';
        el.style.pointerEvents = 'none';
        el.style.animation = `epicFall ${Math.random() * 2 + 1.5}s linear forwards`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }

    // 4. Secret Coupon Injection!
    COUPON_CODES['EPICBUNNY'] = { discount: 99, type: 'percent', label: 'EPIC GOD MODE 👑', freeShip: true };
    applyCoupon('EPICBUNNY');
    
    // Cleanup shake
    setTimeout(() => document.body.style.animation = '', 500);
}
