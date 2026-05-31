import { useAuth } from "../../context/AuthContext";
import { suggestTodaysTasks, getAdaptiveSuggestions, buildWeeklyData, calcGoalProgress } from "../../utils/aiPlanner";
import { format } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";

const SUGGESTION_CLS = {
  warning: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-300",
  urgent:  "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-700 dark:text-red-300",
  success: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  info:    "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-300",
};
const SUGGESTION_ICON = { warning: "⚠", urgent: "●", success: "✓", info: "💡" };

export default function DashboardHome({ goals, tasks, habits, notifications, onNavigate, onToggleTask }) {
  const { user, profile } = useAuth();
  const firstName = (user?.displayName || profile?.fullName || "there").split(" ")[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today     = format(new Date(), "yyyy-MM-dd");

  const todaysTasks  = suggestTodaysTasks(goals, tasks);
  const suggestions  = getAdaptiveSuggestions(goals, tasks, habits);
  const weeklyData   = buildWeeklyData(tasks);

  const completedToday = tasks.filter((t) => t.completed && t.dueDate === today).length;
  const totalToday     = tasks.filter((t) => t.dueDate === today).length;
  const activeGoals    = goals.filter((g) => g.status === "active").length;
  const totalStreak    = habits.reduce((a, h) => a + (h.streak || 0), 0);
  const overdueCount   = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
  const unread         = notifications.filter((n) => !n.read);

  const statCards = [
    { label: "Today", value: `${completedToday}/${totalToday}`, sub: overdueCount > 0 ? `${overdueCount} overdue` : "on track", accent: overdueCount > 0 ? "text-red-500" : "text-accent-500", subAccent: overdueCount > 0 ? "text-red-500" : "text-emerald-500 dark:text-emerald-400", nav: "tasks" },
    { label: "Goals", value: activeGoals, sub: `${goals.length} total`, accent: "text-blue-500", subAccent: "text-surface-500", nav: "goals" },
    { label: "Streaks", value: totalStreak, sub: `${habits.length} habits`, accent: "text-amber-500", subAccent: "text-surface-500", nav: "habits" },
    { label: "Alerts", value: unread.length, sub: unread.length === 0 ? "all clear" : "tap to view", accent: unread.length > 0 ? "text-red-500" : "text-surface-400", subAccent: unread.length > 0 ? "text-red-500" : "text-surface-500", nav: null },
  ];

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-2xl p-5 md:p-7 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.05) 0%, transparent 65%)" }} />
        <p className="text-accent-500 text-xs font-medium tracking-wide uppercase mb-1">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-1">
          {firstName}, let's make today count.
        </h1>
        <p className="text-surface-500 text-sm">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-surface-400 text-xs">Synced · AI planning active</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label}
            onClick={() => s.nav && onNavigate(s.nav)}
            className={`bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-4 transition-all
              ${s.nav ? "hover:border-accent-300 dark:hover:border-accent-500/30 cursor-pointer active:scale-[0.98]" : ""}`}>
            <p className="text-[11px] text-surface-500 uppercase tracking-wider font-medium mb-2">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${s.accent}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${s.subAccent}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Today's tasks + AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Today's tasks */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold">Today's Focus</p>
              <p className="text-surface-500 text-xs mt-0.5">
                {todaysTasks.length === 0 ? "No tasks — add some!" : `${todaysTasks.filter((t) => t.completed).length}/${todaysTasks.length} done`}
              </p>
            </div>
            <button onClick={() => onNavigate("tasks")} className="text-xs text-accent-500 hover:text-accent-600 font-medium">All →</button>
          </div>

          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-40">☐</div>
              <p className="text-sm text-surface-500">Nothing scheduled</p>
              <button onClick={() => onNavigate("goals")} className="mt-2 text-xs text-accent-500 hover:text-accent-600 font-medium">
                Create a goal to auto-generate tasks →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((task) => {
                const isOverdue = task.dueDate && task.dueDate < today;
                return (
                  <div key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${task.completed ? "border-surface-100 dark:border-slate-700 opacity-50"
                        : isOverdue ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5"
                        : "border-surface-200 dark:border-slate-700 hover:border-surface-300 dark:hover:border-slate-600"}`}>
                    <button onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${task.completed ? "bg-accent-500 border-accent-500" : "border-surface-300 dark:border-slate-600 hover:border-accent-400"}`}>
                      {task.completed && <span className="text-white text-[10px]">✓</span>}
                    </button>
                    <span className={`text-sm flex-1 min-w-0 truncate
                      ${task.completed ? "line-through text-surface-400" : isOverdue ? "text-red-600 dark:text-red-400" : "text-surface-800 dark:text-surface-200"}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {task.priority === "high" && !task.completed && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      {task.aiGenerated && <span className="text-[10px] text-accent-400">AI</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-accent-100 dark:bg-accent-500/10 flex items-center justify-center">
              <span className="text-accent-500 text-xs font-bold">✦</span>
            </div>
            <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold">AI Insights</p>
          </div>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">All good! ✓</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i}
                  className={`text-xs p-3 rounded-lg border leading-relaxed flex items-start gap-2
                    ${SUGGESTION_CLS[s.type] || SUGGESTION_CLS.info}`}>
                  <span className="flex-shrink-0 mt-0.5">{SUGGESTION_ICON[s.type]}</span>
                  <span>{s.message}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[{ label: "Goals", nav: "goals" }, { label: "Focus", nav: "pomodoro" }].map(({ label, nav }) => (
              <button key={nav} onClick={() => onNavigate(nav)}
                className="py-2.5 text-xs border border-surface-200 dark:border-slate-700 text-surface-600 dark:text-surface-400 hover:text-accent-500 hover:border-accent-300 dark:hover:border-accent-500/30 rounded-lg font-medium transition-all">
                {label} →
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active goal progress */}
      {goals.filter((g) => g.status === "active").length > 0 && (
        <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold">Active Goals</p>
            <button onClick={() => onNavigate("goals")} className="text-xs text-accent-500 hover:text-accent-600 font-medium">Manage →</button>
          </div>
          <div className="space-y-4">
            {goals.filter((g) => g.status === "active").slice(0, 3).map((g) => {
              const progress = g.progress ?? calcGoalProgress(g.id, tasks);
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-surface-700 dark:text-surface-300 text-sm truncate flex-1 mr-3">{g.title}</span>
                    <span className="text-accent-500 text-sm font-semibold flex-shrink-0">{progress}%</span>
                  </div>
                  <div className="h-2 bg-surface-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: progress >= 75 ? "#10b981" : progress >= 40 ? "#6366f1" : "#f59e0b" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-day chart */}
      <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold">7-Day Progress</p>
          <button onClick={() => onNavigate("analytics")} className="text-xs text-accent-500 hover:text-accent-600 font-medium">Full →</button>
        </div>
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-surface-400 text-sm">Add tasks to see your chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="completed" stroke="#6366F1" fill="url(#grad)" strokeWidth={2} name="Completed"
                dot={{ r: 3, fill: "#6366F1", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
