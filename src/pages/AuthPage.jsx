import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Logo, LogoLight } from "../config/branding.jsx";

// ── Reusable input ─────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-surface-50 dark:bg-slate-800 border text-surface-900 dark:text-surface-100 text-sm px-4 py-3 rounded-lg outline-none transition-all placeholder:text-surface-400
            ${focused ? "border-accent-500 ring-2 ring-accent-500/20" : "border-surface-200 dark:border-slate-700"}
            ${error ? "border-red-500 ring-2 ring-red-500/20" : ""}
            ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 text-sm"
          >
            {show ? "●" : "○"}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Password strength ──────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  if (!password) return null;
  return (
    <div className="mb-4">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "var(--border)" }} />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode]     = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({
    fullName: "", email: "", password: "", confirmPassword: "", userType: "professional"
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form);
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await loginWithGoogle(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: "✦", text: "AI-powered goal breakdown into daily tasks" },
    { icon: "◎", text: "Adaptive planning that learns your pace" },
    { icon: "↻", text: "Habit streaks and Pomodoro focus sessions" },
    { icon: "◇", text: "Real-time analytics and progress charts" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left – editorial panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-accent-600 dark:bg-slate-900 p-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 55%, rgba(255,255,255,0.08) 0%, transparent 65%)" }} />

        {/* Logo */}
        <LogoLight size="md" />

        {/* Headline */}
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            {mode === "login"
              ? (<>Your goals,<br /><span className="text-white/70">amplified</span><br />by AI.</>)
              : (<>Build the life<br />you've<br /><span className="text-white/70">planned.</span></>)
            }
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
            An AI-driven system that converts your ambitions into daily achievable actions.
          </p>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-white/80 mt-0.5 text-sm">{f.icon}</span>
                <span className="text-white/70 text-sm leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="border-l-2 border-white/30 pl-4">
          <p className="text-white/60 text-sm italic leading-relaxed">
            "A goal without a plan is just a wish."
          </p>
          <p className="text-white/40 text-xs mt-1 tracking-wide uppercase">Antoine de Saint-Exupéry</p>
        </div>
      </div>

      {/* ── Right – form ── */}
      <div className="flex items-center justify-center bg-white dark:bg-slate-950 px-8 py-12 transition-colors">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Logo size="sm" />
            <button onClick={toggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-all">
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-surface-500 text-sm mb-7">
            {mode === "login"
              ? "Sign in to your productivity workspace"
              : "Start your AI-powered journey today"}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Input label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Jane Smith" />
            )}
            <Input label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" />
            {mode === "signup" && (
              <>
                <PasswordStrength password={form.password} />
                <Input label="Confirm Password" type="password" value={form.confirmPassword}
                  onChange={set("confirmPassword")} placeholder="Repeat your password" />
                <div className="mb-5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["student", "professional"].map((t) => (
                      <button key={t} type="button"
                        onClick={() => setForm((p) => ({ ...p, userType: t }))}
                        className={`py-2.5 text-sm rounded-lg border transition-all capitalize font-medium
                          ${form.userType === t
                            ? "bg-accent-50 dark:bg-accent-500/10 border-accent-500 text-accent-600 dark:text-accent-400"
                            : "bg-surface-50 dark:bg-slate-800 border-surface-200 dark:border-slate-700 text-surface-600 dark:text-surface-400"}`}
                      >
                        {t === "student" ? "🎓 Student" : "💼 Professional"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-1 h-px bg-surface-200 dark:bg-slate-700" />
            <span className="px-3 text-xs text-surface-400">or</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-slate-700" />
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full py-3 border border-surface-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-surface-50 dark:hover:bg-slate-700 text-surface-700 dark:text-surface-200 text-sm rounded-lg flex items-center justify-center gap-2.5 transition-colors mb-6 font-medium">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-surface-500 text-sm">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-accent-500 hover:text-accent-600 font-medium transition-colors">
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
