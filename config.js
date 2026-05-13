// ============================================================
// VANTA SHOP — CONFIG
// ============================================================
// PASTE YOUR KEYS HERE. This is the only file you need to edit.
// ============================================================

// ---- 1. FIREBASE CONFIG ----
// Get this from: https://console.firebase.google.com
// Project Settings → General → Your apps → Web app → Config
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdefghijklmn"
};

// ---- 2. RAZORPAY CONFIG ----
// Get this from: https://dashboard.razorpay.com → Account → API Keys
// Make sure you are in TEST MODE (toggle top-right). Only need Key ID for frontend.
window.RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_ID_HERE";

// ---- 3. BRAND CONFIG (optional — edit if you want) ----
window.BRAND = {
  name: "VANTA",
  supportEmail: "hello@vanta.in",
  supportPhone: "+91 98765 43210",
  // GST rate (India default 5% for apparel under ₹1000, 12% above)
  gstRate: 0.05,
  shippingFee: 0,        // free shipping — orders above ₹999
  shippingThreshold: 999 // above this, free; below, adds 79
};

// ============================================================
// DON'T EDIT BELOW — these are just flags the code checks
// ============================================================
window.VANTA_READY = !!(
  window.FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY_HERE" &&
  window.RAZORPAY_KEY_ID !== "rzp_test_YOUR_KEY_ID_HERE"
);
