import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Home",      icon: "◈" },
  { id: "goals",     label: "Goals",     icon: "◎" },
  { id: "tasks",     label: "Tasks",     icon: "◻" },
  { id: "habits",    label: "Habits",    icon: "◑" },
  { id: "pomodoro",  label: "Focus",     icon: "◔" },
  { id: "analytics", label: "Analytics", icon: "◇" },
];

// ── Desktop sidebar ───────────────────────────────────────────────────────
function DesktopSidebar({ active, onNavigate, unreadCount }) {
  const { user, profile, logout } = useAuth();
  const initials = (user?.displayName || profile?.fullName || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden lg:flex w-56 bg-ink-950 border-r border-ink-800 flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-800 flex items-center gap-2.5">
        <div className="w-6 h-6 border border-jade-500 flex items-center justify-center flex-shrink-0">
          <span className="text-jade-500 text-[10px]">◈</span>
        </div>
        <span className="font-display text-xs tracking-[0.15em] uppercase text-ink-300">Produx AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all group
              ${active === item.id
                ? "bg-jade-600/15 text-jade-400 border border-jade-600/20"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800 border border-transparent"}`}>
            <span className={`text-sm flex-shrink-0 ${active === item.id ? "text-jade-400" : "text-ink-500 group-hover:text-ink-300"}`}>
              {item.icon}
            </span>
            <span className="text-xs font-medium font-display tracking-wide">{item.label}</span>
            {item.id === "dashboard" && unreadCount > 0 && (
              <span className="ml-auto text-[10px] bg-jade-600 text-white rounded-full px-1.5 py-0.5 font-body">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-ink-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-jade-600/20 border border-jade-600/40 flex items-center justify-center flex-shrink-0">
            <span className="text-jade-400 text-[10px] font-bold font-display">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink-200 text-xs font-medium truncate font-display">
              {user?.displayName || profile?.fullName || "User"}
            </p>
            <p className="text-ink-500 text-[10px] truncate capitalize">{profile?.userType || "member"}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-center text-xs text-ink-500 hover:text-rose-400 transition-colors py-1.5 border border-ink-800 hover:border-rose-500/30 rounded-sm font-body">
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────
function MobileTopBar({ active, onMenuOpen, unreadCount }) {
  const label = navItems.find((n) => n.id === active)?.label || "Dashboard";
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-ink-950/95 backdrop-blur border-b border-ink-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border border-jade-500 flex items-center justify-center">
          <span className="text-jade-500 text-[9px]">◈</span>
        </div>
        <span className="font-display text-xs tracking-widest uppercase text-ink-300">Produx AI</span>
      </div>
      <span className="font-display text-sm font-semibold text-ink-200 capitalize">{label}</span>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <span className="text-[10px] bg-jade-600 text-white rounded-full px-1.5 py-0.5 font-body">
            {unreadCount}
          </span>
        )}
        <button onClick={onMenuOpen}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5">
          <span className="w-5 h-px bg-ink-300 block" />
          <span className="w-5 h-px bg-ink-300 block" />
          <span className="w-3 h-px bg-ink-300 block self-start" />
        </button>
      </div>
    </div>
  );
}

// ── Mobile drawer (slide-in from left) ───────────────────────────────────
function MobileDrawer({ active, onNavigate, onClose }) {
  const { user, profile, logout } = useAuth();
  const initials = (user?.displayName || profile?.fullName || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleNav = (id) => { onNavigate(id); onClose(); };

  return (
    <>
      {/* Backdrop */}
      <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose} />
      {/* Drawer */}
      <div className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-ink-950 border-r border-ink-800 flex flex-col"
        style={{ animation: "slideIn 0.25s ease" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div className="px-5 py-4 border-b border-ink-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-jade-500 flex items-center justify-center">
              <span className="text-jade-500 text-[10px]">◈</span>
            </div>
            <span className="font-display text-xs tracking-widest uppercase text-ink-300">Produx AI</span>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200 text-lg leading-none">×</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-all
                ${active === item.id
                  ? "bg-jade-600/15 text-jade-400 border border-jade-600/20"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800 border border-transparent"}`}>
              <span className={`text-base flex-shrink-0 ${active === item.id ? "text-jade-400" : "text-ink-500"}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium font-display">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-ink-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-jade-600/20 border border-jade-600/40 flex items-center justify-center flex-shrink-0">
              <span className="text-jade-400 text-xs font-bold font-display">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink-200 text-sm font-medium truncate font-display">
                {user?.displayName || profile?.fullName || "User"}
              </p>
              <p className="text-ink-500 text-xs truncate capitalize">{profile?.userType || "member"}</p>
            </div>
          </div>
          <button onClick={() => { logout(); onClose(); }}
            className="w-full text-center text-sm text-ink-500 hover:text-rose-400 transition-colors py-2 border border-ink-800 hover:border-rose-500/30 rounded-sm font-body">
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────
function BottomTabBar({ active, onNavigate }) {
  // Show only 5 most important tabs on bottom bar
  const bottomTabs = navItems.slice(0, 5);
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink-950/95 backdrop-blur border-t border-ink-800 flex">
      {bottomTabs.map((item) => (
        <button key={item.id} onClick={() => onNavigate(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all
            ${active === item.id ? "text-jade-400" : "text-ink-600 hover:text-ink-400"}`}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span className={`text-[10px] font-display tracking-wide ${active === item.id ? "text-jade-400" : "text-ink-600"}`}>
            {item.label}
          </span>
          {active === item.id && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-jade-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function Sidebar({ active, onNavigate, unreadCount }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar active={active} onNavigate={onNavigate} unreadCount={unreadCount} />

      {/* Mobile top bar */}
      <MobileTopBar active={active} onMenuOpen={() => setDrawerOpen(true)} unreadCount={unreadCount} />

      {/* Mobile drawer */}
      {drawerOpen && (
        <MobileDrawer active={active} onNavigate={onNavigate} onClose={() => setDrawerOpen(false)} />
      )}

      {/* Mobile bottom tab bar */}
      <BottomTabBar active={active} onNavigate={onNavigate} />
    </>
  );
}
