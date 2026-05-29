import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ── Reusable input ─────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-1.5 font-display">
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
          className={`w-full bg-ink-800 border text-ink-100 text-sm font-body px-3.5 py-2.5 rounded-sm outline-none transition-all placeholder:text-ink-500
            ${focused ? "border-jade-500" : "border-ink-600"}
            ${error ? "border-rose-500" : ""}
            ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs"
          >
            {show ? "●" : "○"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400 font-body">{error}</p>}
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
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "#333" }} />
        ))}
      </div>
      <span className="text-[11px] font-body" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
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
    { icon: "◈", text: "AI-powered goal breakdown into daily tasks" },
    { icon: "◉", text: "Adaptive planning that learns your pace" },
    { icon: "◌", text: "Habit streaks and Pomodoro focus sessions" },
    { icon: "◍", text: "Real-time analytics and progress charts" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-body">
      {/* ── Left – dark editorial panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-950 p-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 55%, rgba(61,122,87,0.10) 0%, transparent 65%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-jade-500 flex items-center justify-center">
            <span className="text-jade-500 text-xs">◈</span>
          </div>
          <span className="text-ink-400 text-xs tracking-[0.15em] uppercase font-display">Produx AI</span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-display text-5xl font-bold text-ink-100 leading-tight tracking-tight mb-5">
            {mode === "login"
              ? (<>Your goals,<br /><span className="text-jade-400">amplified</span><br />by AI.</>)
              : (<>Build the life<br />you've<br /><span className="text-jade-400">planned.</span></>)
            }
          </h1>
          <p className="text-ink-500 text-sm leading-relaxed mb-8 max-w-xs">
            An AI-driven system that converts your ambitions into daily achievable actions.
          </p>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-jade-500 mt-0.5 text-sm">{f.icon}</span>
                <span className="text-ink-400 text-sm leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="border-l-2 border-jade-600 pl-4">
          <p className="text-ink-500 text-sm italic leading-relaxed">
            "A goal without a plan is just a wish."
          </p>
          <p className="text-ink-600 text-xs mt-1 tracking-widest uppercase">Antoine de Saint-Exupéry</p>
        </div>
      </div>

      {/* ── Right – form ── */}
      <div className="flex items-center justify-center bg-ink-900 px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-6 h-6 border border-jade-500 flex items-center justify-center">
              <span className="text-jade-500 text-[10px]">◈</span>
            </div>
            <span className="text-ink-400 text-xs tracking-widest uppercase font-display">Produx AI</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink-100 mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-ink-500 text-sm mb-7">
            {mode === "login"
              ? "Sign in to your productivity workspace"
              : "Start your AI-powered journey today"}
          </p>

          {error && (
            <div className="mb-5 px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-sm">
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
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-2 font-display">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["student", "professional"].map((t) => (
                      <button key={t} type="button"
                        onClick={() => setForm((p) => ({ ...p, userType: t }))}
                        className={`py-2 text-sm rounded-sm border transition-all font-body capitalize
                          ${form.userType === t
                            ? "bg-jade-600/20 border-jade-500 text-jade-400 font-medium"
                            : "bg-ink-800 border-ink-600 text-ink-400"}`}
                      >
                        {t === "student" ? "🎓 Student" : "💼 Professional"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-jade-600 hover:bg-jade-500 disabled:opacity-60 text-white text-sm font-medium rounded-sm transition-colors mb-4 font-display tracking-wide">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center">
            <div className="flex-1 h-px bg-ink-700" />
            <span className="px-3 text-xs text-ink-500">or</span>
            <div className="flex-1 h-px bg-ink-700" />
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full py-2.5 border border-ink-600 bg-ink-800 hover:bg-ink-700 text-ink-200 text-sm rounded-sm flex items-center justify-center gap-2.5 transition-colors mb-6 font-body">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-ink-500 text-sm">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-jade-400 hover:text-jade-300 font-medium transition-colors">
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
