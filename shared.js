// shared.js — runs on every page, handles cart state, auth state, UI sync

// ============================================================
// CART STATE (localStorage, survives page reloads)
// ============================================================
const CART_KEY = "vanta_cart_v1";

window.VantaCart = {
  // Returns: [{id, title, variant, size, price, oldPrice, image, qty}, ...]
  getAll() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("vanta-cart-updated"));
  },
  add(item) {
    const items = this.getAll();
    // dedupe by id+size
    const key = `${item.id}__${item.size || "na"}`;
    const existing = items.find(i => `${i.id}__${i.size || "na"}` === key);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      items.push({ ...item, qty: item.qty || 1 });
    }
    this.save(items);
  },
  updateQty(id, size, qty) {
    const items = this.getAll();
    const item = items.find(i => i.id === id && (i.size || "na") === (size || "na"));
    if (!item) return;
    if (qty <= 0) {
      this.save(items.filter(i => !(i.id === id && (i.size || "na") === (size || "na"))));
    } else {
      item.qty = qty;
      this.save(items);
    }
  },
  remove(id, size) {
    const items = this.getAll().filter(i => !(i.id === id && (i.size || "na") === (size || "na")));
    this.save(items);
  },
  clear() { this.save([]); },
  count() { return this.getAll().reduce((s, i) => s + i.qty, 0); },
  subtotal() { return this.getAll().reduce((s, i) => s + i.price * i.qty, 0); },
  totals() {
    const subtotal = this.subtotal();
    const gst = Math.round(subtotal * (window.BRAND?.gstRate || 0.05));
    const threshold = window.BRAND?.shippingThreshold || 999;
    const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 79;
    const total = subtotal + gst + shipping;
    return { subtotal, gst, shipping, total };
  }
};

// ============================================================
// FORMATTERS
// ============================================================
window.formatINR = n => "₹" + Math.round(n).toLocaleString("en-IN");

// ============================================================
// AUTH STATE — updates nav on every page
// ============================================================
window.VantaAuth = {
  currentUser: null,
  _listeners: [],
  onChange(cb) { this._listeners.push(cb); if (this.currentUser !== undefined) cb(this.currentUser); },
  _emit(user) {
    this.currentUser = user;
    this._listeners.forEach(cb => cb(user));
    window.dispatchEvent(new CustomEvent("vanta-auth-changed", { detail: user }));
  },
  async logout() {
    if (!window.VantaFB?.auth) {
      // demo mode
      localStorage.removeItem("vanta_demo_user");
      this._emit(null);
      return;
    }
    await window.VantaFB.signOut(window.VantaFB.auth);
  }
};

// Wait for Firebase to be ready, then hook up
function hookAuth() {
  if (window.VantaFB?.auth) {
    window.VantaFB.onAuthStateChanged(window.VantaFB.auth, (user) => {
      window.VantaAuth._emit(user);
    });
  } else {
    // demo mode — use localStorage user
    const demo = localStorage.getItem("vanta_demo_user");
    window.VantaAuth._emit(demo ? JSON.parse(demo) : null);
  }
}
if (window.VantaFB) hookAuth();
else window.addEventListener("vanta-fb-ready", hookAuth);

// ============================================================
// DEMO MODE fallback (when keys aren't set)
// ============================================================
window.VantaDemo = {
  enabled: () => !window.VANTA_READY,
  
  // Store users in localStorage for demo
  getUsers() {
    return JSON.parse(localStorage.getItem("vanta_demo_users") || "{}");
  },
  
  saveUser(user) {
    const users = this.getUsers();
    users[user.uid] = user;
    localStorage.setItem("vanta_demo_users", JSON.stringify(users));
  },
  
  signup(email, password, name) {
    const users = this.getUsers();
    
    // Check if email already exists
    const existing = Object.values(users).find(u => u.email === email);
    if (existing) {
      throw new Error("auth/email-already-in-use");
    }
    
    // Validate password
    if (password.length < 6) {
      throw new Error("auth/weak-password");
    }
    
    // Create new user
    const uid = "demo_" + Date.now();
    const user = {
      uid,
      email,
      displayName: name,
      password, // In demo mode only - not secure for production
      createdAt: new Date().toISOString(),
      demo: true
    };
    
    this.saveUser(user);
    localStorage.setItem("vanta_demo_user", JSON.stringify(user));
    window.VantaAuth._emit(user);
    return user;
  },
  
  login(email, password) {
    const users = this.getUsers();
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
      throw new Error("auth/user-not-found");
    }
    
    // For demo, if password is provided, check it. If not, allow login (for testing)
    if (password && user.password !== password) {
      throw new Error("auth/wrong-password");
    }
    
    localStorage.setItem("vanta_demo_user", JSON.stringify(user));
    window.VantaAuth._emit(user);
    return user;
  },
  
  logout() {
    localStorage.removeItem("vanta_demo_user");
    window.VantaAuth._emit(null);
  },
  
  getCurrentUser() {
    const user = localStorage.getItem("vanta_demo_user");
    return user ? JSON.parse(user) : null;
  },
  
  saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem("vanta_demo_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("vanta_demo_orders", JSON.stringify(orders));
  },
  
  getOrders() {
    return JSON.parse(localStorage.getItem("vanta_demo_orders") || "[]");
  }
};

// ============================================================
// NAV UPDATER — auto-updates cart badge + login state
// ============================================================
function syncNav() {
  // Cart badge
  document.querySelectorAll(".cart-badge, [data-cart-count]").forEach(el => {
    el.textContent = window.VantaCart.count();
  });
  // Auth-conditional elements
  const user = window.VantaAuth.currentUser;
  document.querySelectorAll("[data-auth-name]").forEach(el => {
    el.textContent = user?.displayName || user?.email?.split("@")[0] || "";
  });
  document.querySelectorAll("[data-auth-show='in']").forEach(el => {
    el.style.display = user ? "" : "none";
  });
  document.querySelectorAll("[data-auth-show='out']").forEach(el => {
    el.style.display = user ? "none" : "";
  });
}
window.addEventListener("vanta-cart-updated", syncNav);
window.addEventListener("vanta-auth-changed", syncNav);
document.addEventListener("DOMContentLoaded", syncNav);

// ============================================================
// TOAST (small popup feedback)
// ============================================================
window.VantaToast = (msg, kind = "ok") => {
  let toast = document.getElementById("vanta-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "vanta-toast";
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#0d1b3d;color:#fff;padding:12px 20px;border-radius:999px;
      font-family:'Familjen Grotesk',system-ui,sans-serif;font-size:14px;font-weight:500;
      box-shadow:0 20px 50px rgba(0,0,0,0.3);z-index:9999;
      opacity:0;transition:opacity .25s, transform .25s;pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = kind === "error" ? "#e63946" : kind === "success" ? "#22c55e" : "#0d1b3d";
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
  }, 2400);
};

// ============================================================
// PRODUCT CATALOG (shared across pages)
// ============================================================
window.VANTA_PRODUCTS = {
  "wave-tee":        { title: "Signature Wave Tee",        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", price: 1799, oldPrice: 2499 },
  "heritage-tee":    { title: "Heritage Logo Tee — Bone",  image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", price: 1499, oldPrice: 1999 },
  "deep-blue-hoodie":{ title: "Deep Blue Oversized Hoodie",image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", price: 3299, oldPrice: 4499 },
  "circle-crest":    { title: "Circle Crest Tee — White",  image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", price: 1599, oldPrice: 2199 },
  "wave-cap":        { title: "Wave Dad Cap — Navy",       image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80", price: 999,  oldPrice: 1499 },
  "wear-wave-tee":   { title: "Wear the Wave Tee — Navy",  image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80", price: 1799, oldPrice: 2499 },
  "cloud-hoodie":    { title: "Cloud White Hoodie",        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80", price: 2999, oldPrice: 3999 },
  "canvas-tote":     { title: "Canvas Tote Bag",           image: "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&q=80", price: 799,  oldPrice: 1199 }
};
