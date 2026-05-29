import { useAuth } from "../../context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "goals",     label: "Goals",     icon: "◎" },
  { id: "tasks",     label: "Tasks",     icon: "◻" },
  { id: "habits",    label: "Habits",    icon: "◑" },
  { id: "pomodoro",  label: "Focus",     icon: "◔" },
  { id: "analytics", label: "Analytics", icon: "◇" },
];

export default function Sidebar({ active, onNavigate, unreadCount }) {
  const { user, profile, logout } = useAuth();
  const initials = (user?.displayName || profile?.fullName || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="w-56 bg-ink-950 border-r border-ink-800 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-5 py-5 border-b border-ink-800 flex items-center gap-2.5">
        <div className="w-6 h-6 border border-jade-500 flex items-center justify-center flex-shrink-0">
          <span className="text-jade-500 text-[10px]">◈</span>
        </div>
        <span className="font-display text-xs tracking-[0.15em] uppercase text-ink-300">Produx AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all group
              ${active === item.id
                ? "bg-jade-600/15 text-jade-400 border border-jade-600/20"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800 border border-transparent"}`}
          >
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
