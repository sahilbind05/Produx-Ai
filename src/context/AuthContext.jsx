import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { createUserProfile, getUserProfile } from "../firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watch Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load Firestore profile
        const snap = await getUserProfile(firebaseUser.uid);
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Signup ──────────────────────────────────────────────────────────────
  const signup = async ({ fullName, email, password, userType }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: fullName });
    await createUserProfile(cred.user.uid, {
      fullName,
      email,
      userType,        // "student" | "professional"
      photoURL: null,
    });
    const snap = await getUserProfile(cred.user.uid);
    setProfile(snap.data());
    return cred.user;
  };

  // ── Login ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getUserProfile(cred.user.uid);
    setProfile(snap.exists() ? snap.data() : null);
    return cred.user;
  };

  // ── Google Login ────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    // Create profile if first time
    const snap = await getUserProfile(cred.user.uid);
    if (!snap.exists()) {
      await createUserProfile(cred.user.uid, {
        fullName: cred.user.displayName,
        email:    cred.user.email,
        userType: "professional",
        photoURL: cred.user.photoURL,
      });
    }
    const updatedSnap = await getUserProfile(cred.user.uid);
    setProfile(updatedSnap.data());
    return cred.user;
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
