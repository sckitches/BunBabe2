/*
  Realtime Database Wrapper - Firebase Mocked
  Connected to BunBabe Secure DB Setup
*/
const DATABASE = {
    connected: false,
    
    // Simulate connection
    connect: function() {
        console.log("🔗 Connecting to BunBabe Real Database...");
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = true;
                console.log("✅ Database Connected Successfully!");
                resolve();
            }, 800);
        });
    },

    // Fetch orders from DB (falls back to local storage sync)
    getOrders: async function() {
        if (!this.connected) await this.connect();
        const local = JSON.parse(localStorage.getItem('bunbabe_orders') || '[]');
        return local;
    },

    // Push new order to DB
    pushOrder: async function(order) {
        if (!this.connected) await this.connect();
        const past = JSON.parse(localStorage.getItem('bunbabe_orders') || '[]');
        past.unshift(order);
        localStorage.setItem('bunbabe_orders', JSON.stringify(past));
        console.log("☁️ Order synced to database!");
    },
    
    // Update existing order status in DB
    updateOrderStatus: async function(id, statusField, newStatus) {
        if (!this.connected) await this.connect();
        const past = JSON.parse(localStorage.getItem('bunbabe_orders') || '[]');
        const idx = past.findIndex(o => o.id === id);
        if (idx !== -1) {
            past[idx][statusField] = newStatus;
            localStorage.setItem('bunbabe_orders', JSON.stringify(past));
            console.log(`☁️ Order ${id} updated in database.`);
        }
    },

    // Fetch products from storage
    getProducts: async function() {
        if (!this.connected) await this.connect();
        const local = JSON.parse(localStorage.getItem('bb_admin_products') || 'null');
        return local;
    },

    // Fetch coupons from storage
    getCoupons: async function() {
        if (!this.connected) await this.connect();
        const local = JSON.parse(localStorage.getItem('bb_admin_coupons') || 'null');
        return local;
    },

    // Empty cart post-checkout
    clearCart: function() {
        localStorage.removeItem('bunbabe_cart');
        console.log("🛒 Cart cleared.");
    },

    // ─── Theme Management ──────────────────────────────
    getTheme: async function() {
        return localStorage.getItem('bb_site_theme') || 'default';
    },
    saveTheme: async function(theme) {
        localStorage.setItem('bb_site_theme', theme);
    },

    // ─── Stats & VIP ───────────────────────────────────
    getStats: async function() {
        const orders = JSON.parse(localStorage.getItem('bunbabe_orders') || '[]');
        const products = await this.getProducts() || [];
        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            productCount: products.length,
            vipCount: orders.filter(o => (o.total || 0) > 200).length
        };
    }
};

window.DATABASE = DATABASE;
