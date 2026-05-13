# VANTA Shop — Setup Guide

A working multi-page e-commerce site with Firebase Auth + Firestore + Razorpay payments.

## 🎯 Quick Start (Demo Mode — 30 seconds)

You can run this **right now with zero setup** in demo mode:

```bash
cd vanta-shop
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. Everything works — signup, cart, checkout, orders — using fake local storage. No Firebase or Razorpay needed.

> ⚠️ **Don't just double-click index.html** — Firebase uses ES modules which require a real HTTP server. Use `python3 -m http.server` or any dev server.

---

## 🔑 Production Mode (Real Backend — 15 minutes)

### Step 1: Firebase (Auth + Database)

1. Go to https://console.firebase.google.com → **Add project** → name it `vanta-shop`
2. Skip Google Analytics (optional)
3. Once created, click the **Web icon (`</>`)** to add a web app
4. Register app as `vanta-web` → copy the `firebaseConfig` object
5. In the left sidebar:
   - **Build → Authentication → Get started** → enable **Email/Password** and **Google**
   - **Build → Firestore Database → Create database** → start in **test mode** → pick a region (asia-south1 for India)
6. Paste the config into `config.js`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "vanta-shop.firebaseapp.com",
  projectId: "vanta-shop",
  storageBucket: "vanta-shop.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### Step 2: Razorpay (Payments)

1. Go to https://dashboard.razorpay.com/signup → create account (test mode is free, no KYC)
2. Stay in **Test Mode** (toggle in top-right of dashboard)
3. Go to **Account → API Keys → Generate Test Key**
4. Copy the **Key ID** (starts with `rzp_test_...`)
5. Paste into `config.js`:

```js
window.RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxx";
```

### Step 3: Test the Full Flow

Start the server and test:

1. Open `http://localhost:8000`
2. Click **Login** → **Create Account** → sign up with any email
3. Add an item to cart → go to cart → **Proceed to Checkout**
4. Fill address → pick **UPI** → **Place Order**
5. In the Razorpay modal, use test credentials:
   - **UPI**: `success@razorpay`
   - **Card**: `4111 1111 1111 1111`, any future expiry, any CVV, any OTP
6. You'll hit the success page → visit **My Account** to see the order

---

## 📁 File Structure

```
vanta-shop/
├── config.js              ← EDIT THIS — paste your keys here
├── firebase-init.js       ← Firebase SDK setup (don't edit)
├── shared.js              ← Cart, auth, helpers (don't edit)
├── styles.css             ← Shared styles
├── index.html             ← Landing page
├── login.html             ← Login / Signup
├── cart.html              ← Shopping cart
├── checkout.html          ← Address + Razorpay payment
├── success.html           ← Order confirmation
├── account.html           ← Profile + order history
└── README.md              ← This file
```

---

## 🎬 Creator Reel URLs

The 5 creator reels in `index.html` currently point to placeholders:
- `https://www.instagram.com/reel/PLACEHOLDER_1/`
- `https://www.tiktok.com/@PLACEHOLDER_USER/video/PLACEHOLDER_2`
- `https://www.instagram.com/reel/PLACEHOLDER_3/`
- `https://www.youtube.com/shorts/PLACEHOLDER_4`
- `https://www.tiktok.com/@PLACEHOLDER_USER/video/PLACEHOLDER_5`

**To use real URLs:** open `index.html`, search for `PLACEHOLDER_`, and replace each with your actual reel URLs. They'll open in a new tab when clicked.

---

## 🧪 Razorpay Test Credentials

In test mode, use these to simulate payments:

| Method | Credential | Result |
|--------|-----------|--------|
| UPI    | `success@razorpay` | Success |
| UPI    | `failure@razorpay` | Failure |
| Card   | `4111 1111 1111 1111` | Success |
| Card   | `5104 0600 0000 0008` | Success (Mastercard) |

Any future expiry date, any 3-digit CVV, any 6-digit OTP (e.g. `1234`).

---

## 🛠️ Troubleshooting

**"Firebase: Error (auth/configuration-not-found)"**
You haven't enabled Email/Password or Google sign-in in Firebase Console → Authentication → Sign-in method.

**"Missing or insufficient permissions" when saving orders**
Your Firestore is in production mode. Either switch to test mode, or update rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Razorpay modal doesn't open**
Check the browser console. Most likely your Key ID is wrong or still the placeholder value.

**"Cannot use import statement outside a module"**
You opened the HTML file directly (`file://`). Use `python3 -m http.server 8000` instead.

---

## 🚀 Deploy to the Web (Optional)

When you're ready to share a live URL:

**Vercel (easiest):**
```bash
npm i -g vercel
cd vanta-shop
vercel
```

**Netlify:**
Drag the `vanta-shop` folder onto https://app.netlify.com/drop

Both are free and give you an HTTPS URL in under a minute.

---

## 📋 What's NOT Included (for production later)

This is a solid test/demo shop but for real customers you'd also want:
- Order fulfillment logic (Shiprocket / Delhivery integration)
- Email receipts (Resend / SendGrid)
- SMS OTPs for phone verification (MSG91 / Twilio)
- GST invoice PDF generation
- Inventory tracking
- Admin dashboard to manage orders
- Razorpay **live mode** activation (requires business KYC: PAN, GST, bank account)
- Proper Firestore security rules
- Return / refund workflow

Each of these is a separate build. The foundation here handles auth, cart state, payments, and order storage — enough to validate the concept with real test payments and a real user database.

---

Built with ❤️ for VANTA.
