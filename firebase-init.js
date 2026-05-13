// firebase-init.js — loaded as a module, sets up Firebase globals
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Wait for config.js to load
if (!window.FIREBASE_CONFIG) {
  console.error("[VANTA] config.js not loaded — include it BEFORE firebase-init.js");
}

// Check if keys are configured
if (!window.VANTA_READY) {
  console.warn(
    "%c[VANTA] ⚠ Firebase/Razorpay keys are placeholder values. " +
    "Auth and payments will be in DEMO MODE. Edit config.js to enable real backend.",
    "color:#f5a623;font-weight:bold;font-size:13px;"
  );
}

// Initialize Firebase (only if real keys present)
let app, auth, db;
if (window.VANTA_READY) {
  app = initializeApp(window.FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("%c[VANTA] ✓ Firebase connected", "color:#22c55e;font-weight:bold");
}

// Expose everything on window for other scripts
window.VantaFB = {
  app, auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, query, where, orderBy, getDocs,
  serverTimestamp
};

// Notify anything waiting
window.dispatchEvent(new Event("vanta-fb-ready"));
