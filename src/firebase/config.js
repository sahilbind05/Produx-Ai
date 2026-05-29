// ─── Firebase Configuration ────────────────────────────────────────────────
// Option A (recommended): put values in src/firebase/config.js directly
// Option B: create a .env file at project root using .env.example as template
//           then use import.meta.env.VITE_FIREBASE_* variables below

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ── Paste your Firebase project credentials here ──────────────────────────
// Get them from: console.firebase.google.com
//   → Your project → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyAAlD6I-zc_do5b2HHd0_lW-8NqttyDAxk",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "produx-ai-c6c3c.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "produx-ai-c6c3c",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "produx-ai-c6c3c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "558548974521",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:558548974521:web:1a5116c40a36bf6a639468",
};

// Initialize
const app = initializeApp(firebaseConfig);

export const auth          = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db            = getFirestore(app);

export default app;
