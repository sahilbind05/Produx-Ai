import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Logo, APP_VERSION } from "../../config/branding.jsx";

const navItems = [
  { id: "dashboard", label: "Home",      icon: "⌂" },
  { id: "goals",     label: "Goals",     icon: "◎" },
  { id: "tasks",     label: "Tasks",     icon: "☐" },
  { id: "habits",    label: "Habits",    icon: "↻" },
  { id: "pomodoro",  label: "Focus",     icon: "◔" },
  { id: "analytics", label: "Analytics", icon: "◇" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
      aria-label="Toggle theme">
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────
function DesktopSidebar({ active, onNavigate, unreadCount }) {
  const { user, profile, logout } = useAuth();
  const initials = (user?.displayName || profile?.fullName || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-surface-200 dark:border-slate-800 flex-col h-screen sticky top-0 flex-shrink-0 transition-colors">
      {/* Logo */}
      <div className="px-5 py-5">
        <Logo size="md" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group
              ${active === item.id
                ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium"
                : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-slate-800"}`}>
            <span className={`text-base flex-shrink-0 ${active === item.id ? "text-accent-500" : "text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300"}`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
            {item.id === "dashboard" && unreadCount > 0 && (
              <span className="ml-auto text-[11px] bg-accent-500 text-white rounded-full px-1.5 py-0.5 font-medium">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-surface-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-600 dark:text-accent-400 text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface-900 dark:text-surface-100 text-sm font-medium truncate">
              {user?.displayName || profile?.fullName || "User"}
            </p>
            <p className="text-surface-500 dark:text-surface-400 text-xs truncate capitalize">{profile?.userType || "member"}</p>
          </div>
          <ThemeToggle />
        </div>
        <button onClick={logout}
          className="w-full text-center text-sm text-surface-500 hover:text-red-500 dark:text-surface-400 dark:hover:text-red-400 transition-colors py-2 border border-surface-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/30 rounded-lg">
          Sign out
        </button>
        <p className="text-center text-[10px] text-surface-400 mt-3">v{APP_VERSION}</p>
      </div>
    </aside>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────
function MobileTopBar({ active, onMenuOpen, unreadCount }) {
  const label = navItems.find((n) => n.id === active)?.label || "Dashboard";
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-surface-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors">
      <Logo size="sm" />
      <span className="text-sm font-medium text-surface-700 dark:text-surface-300 capitalize">{label}</span>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <span className="text-[11px] bg-accent-500 text-white rounded-full px-1.5 py-0.5 font-medium">
            {unreadCount}
          </span>
        )}
        <button onClick={onMenuOpen}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors">
          <span className="w-5 h-px bg-surface-600 dark:bg-surface-300 block" />
          <span className="w-5 h-px bg-surface-600 dark:bg-surface-300 block" />
          <span className="w-3 h-px bg-surface-600 dark:bg-surface-300 block self-start ml-1.5" />
        </button>
      </div>
    </div>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────
function MobileDrawer({ active, onNavigate, onClose }) {
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const initials = (user?.displayName || profile?.fullName || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleNav = (id) => { onNavigate(id); onClose(); };

  return (
    <>
      <div className="lg:hidden fixed inset-0 z-50 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-surface-200 dark:border-slate-800 flex flex-col shadow-2xl"
        style={{ animation: "slideIn 0.2s ease" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

        <div className="px-5 py-4 border-b border-surface-200 dark:border-slate-800 flex items-center justify-between">
          <Logo size="md" />
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 text-xl leading-none">×</button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                ${active === item.id
                  ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-slate-800"}`}>
              <span className={`text-lg flex-shrink-0 ${active === item.id ? "text-accent-500" : "text-surface-400 dark:text-surface-500"}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-surface-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-600 dark:text-accent-400 text-sm font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-surface-900 dark:text-surface-100 text-sm font-medium truncate">
                {user?.displayName || profile?.fullName || "User"}
              </p>
              <p className="text-surface-500 text-xs truncate capitalize">{profile?.userType || "member"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggle}
              className="flex-1 text-center text-sm text-surface-600 dark:text-surface-300 py-2.5 border border-surface-200 dark:border-slate-700 rounded-lg transition-colors hover:bg-surface-50 dark:hover:bg-slate-800">
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </button>
            <button onClick={() => { logout(); onClose(); }}
              className="flex-1 text-center text-sm text-red-500 dark:text-red-400 py-2.5 border border-surface-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/30 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
          <p className="text-center text-[10px] text-surface-400 mt-3">v{APP_VERSION}</p>
        </div>
      </div>
    </>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────
function BottomTabBar({ active, onNavigate }) {
  const bottomTabs = navItems.slice(0, 5);
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-surface-200 dark:border-slate-800 flex transition-colors">
      {bottomTabs.map((item) => (
        <button key={item.id} onClick={() => onNavigate(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-all
            ${active === item.id ? "text-accent-500" : "text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300"}`}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span className={`text-[10px] font-medium ${active === item.id ? "text-accent-500" : "text-surface-400 dark:text-surface-500"}`}>
            {item.label}
          </span>
          {active === item.id && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-500 rounded-full" />
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
      <DesktopSidebar active={active} onNavigate={onNavigate} unreadCount={unreadCount} />
      <MobileTopBar active={active} onMenuOpen={() => setDrawerOpen(true)} unreadCount={unreadCount} />
      {drawerOpen && (
        <MobileDrawer active={active} onNavigate={onNavigate} onClose={() => setDrawerOpen(false)} />
      )}
      <BottomTabBar active={active} onNavigate={onNavigate} />
    </>
  );
}
