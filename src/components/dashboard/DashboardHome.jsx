import { useAuth } from "../../context/AuthContext";
import { suggestTodaysTasks, getAdaptiveSuggestions, buildWeeklyData, calcGoalProgress } from "../../utils/aiPlanner";
import { format } from "date-fns";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, Tooltip, CartesianGrid,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#1A1A1A",
  border: "0.5px solid #333",
  borderRadius: "2px",
  color: "#F0EFEB",
  fontSize: "12px",
  fontFamily: "DM Sans",
};

const SUGGESTION_CLS = {
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  urgent:  "border-rose-500/30  bg-rose-500/5  text-rose-300",
  success: "border-jade-600/30  bg-jade-600/5  text-jade-300",
  info:    "border-sky-500/30   bg-sky-500/5   text-sky-300",
};

const SUGGESTION_ICON = { warning: "⚠", urgent: "🔴", success: "✓", info: "💡" };

export default function DashboardHome({ goals, tasks, habits, notifications, onNavigate, onToggleTask }) {
  const { user, profile } = useAuth();
  const firstName = (user?.displayName || profile?.fullName || "there").split(" ")[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today     = format(new Date(), "yyyy-MM-dd");

  const todaysTasks  = suggestTodaysTasks(goals, tasks);
  const suggestions  = getAdaptiveSuggestions(goals, tasks, habits);
  const weeklyData   = buildWeeklyData(tasks);
  const unread       = notifications.filter((n) => !n.read);

  const completedToday = tasks.filter((t) => t.completed && t.dueDate === today).length;
  const totalToday     = tasks.filter((t) => t.dueDate === today).length;
  const activeGoals    = goals.filter((g) => g.status === "active").length;
  const totalStreak    = habits.reduce((a, h) => a + (h.streak || 0), 0);
  const overdueCount   = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;

  const statCards = [
    {
      label: "Today's Tasks",
      value: `${completedToday}/${totalToday}`,
      sub: overdueCount > 0 ? `${overdueCount} overdue` : "on track",
      subColor: overdueCount > 0 ? "#F43F5E" : "#3D7A57",
      color: "#3D7A57",
      nav: "tasks",
    },
    {
      label: "Active Goals",
      value: activeGoals,
      sub: `${goals.length} total`,
      subColor: "#555",
      color: "#0EA5E9",
      nav: "goals",
    },
    {
      label: "Habit Streaks",
      value: totalStreak,
      sub: `${habits.length} habit${habits.length !== 1 ? "s" : ""} tracked`,
      subColor: "#555",
      color: "#F59E0B",
      nav: "habits",
    },
    {
      label: "Unread Alerts",
      value: unread.length,
      sub: unread.length === 0 ? "all clear" : "needs attention",
      subColor: unread.length > 0 ? "#F43F5E" : "#555",
      color: unread.length > 0 ? "#F43F5E" : "#555",
      nav: null,
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Greeting hero ── */}
      <div className="bg-ink-950 border border-ink-800 rounded-sm p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(61,122,87,0.07) 0%, transparent 65%)" }}
        />
        <p className="text-jade-500 text-[11px] tracking-widest uppercase font-display mb-1">{greeting}</p>
        <h1 className="font-display text-2xl font-bold text-ink-100 mb-1">
          {firstName}, let's make today count.
        </h1>
        <p className="text-ink-500 text-sm font-body">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
          <span className="text-ink-600 text-xs font-body">Firebase sync active · AI planning enabled</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            onClick={() => s.nav && onNavigate(s.nav)}
            className={`bg-ink-800 border border-ink-700 rounded-sm p-4 transition-colors
              ${s.nav ? "hover:border-ink-600 cursor-pointer" : ""}`}
          >
            <p className="text-[11px] text-ink-500 uppercase tracking-widest font-display mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] font-body mt-1" style={{ color: s.subColor }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Today's focus tasks */}
        <div className="lg:col-span-3 bg-ink-800 border border-ink-700 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-ink-200 text-sm font-display font-medium">Today's Focus</p>
              <p className="text-ink-600 text-[11px] font-body mt-0.5">
                {todaysTasks.length === 0
                  ? "No tasks scheduled — add some!"
                  : `${todaysTasks.filter((t) => t.completed).length}/${todaysTasks.length} done`}
              </p>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs text-jade-500 hover:text-jade-400 font-body transition-colors"
            >
              All tasks →
            </button>
          </div>

          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">◻</div>
              <p className="text-sm font-display text-ink-600">Nothing scheduled yet</p>
              <button
                onClick={() => onNavigate("goals")}
                className="mt-2 text-xs text-jade-500 hover:text-jade-400 font-body transition-colors"
              >
                Create a goal to auto-generate tasks →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((task) => {
                const isOverdue = task.dueDate && task.dueDate < today;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-2.5 rounded-sm border transition-all
                      ${task.completed
                        ? "border-ink-800 opacity-50"
                        : isOverdue
                          ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40"
                          : "border-ink-700 hover:border-ink-600"}`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-all
                        ${task.completed
                          ? "bg-jade-600 border-jade-600 text-white"
                          : "border-ink-500 hover:border-jade-500"}`}
                    >
                      {task.completed && <span className="text-[10px]">✓</span>}
                    </button>

                    <span
                      className={`text-sm font-body flex-1 min-w-0 truncate
                        ${task.completed ? "line-through text-ink-600" : isOverdue ? "text-rose-300" : "text-ink-100"}`}
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {task.priority === "high" && !task.completed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                      )}
                      {isOverdue && !task.completed && (
                        <span className="text-[9px] text-rose-400 font-body">overdue</span>
                      )}
                      {task.aiGenerated && (
                        <span className="text-[10px] text-jade-700">◈</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 bg-ink-800 border border-ink-700 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-jade-500 text-sm">◈</span>
            <p className="text-ink-200 text-sm font-display font-medium">AI Insights</p>
          </div>

          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm font-display text-ink-500">All good!</p>
              <p className="text-xs font-body text-ink-700 mt-1">No suggestions right now.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`text-xs p-3 rounded-sm border font-body leading-relaxed flex items-start gap-2
                    ${SUGGESTION_CLS[s.type] || SUGGESTION_CLS.info}`}
                >
                  <span className="flex-shrink-0 mt-0.5">{SUGGESTION_ICON[s.type]}</span>
                  <span>{s.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick navigate buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Goals", nav: "goals" },
              { label: "Focus", nav: "pomodoro" },
            ].map(({ label, nav }) => (
              <button
                key={nav}
                onClick={() => onNavigate(nav)}
                className="py-1.5 text-xs border border-ink-700 hover:border-jade-600/40 text-ink-500 hover:text-jade-400 rounded-sm font-display transition-colors"
              >
                {label} →
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Goal progress row ── */}
      {goals.filter((g) => g.status === "active").length > 0 && (
        <div className="bg-ink-800 border border-ink-700 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-200 text-sm font-display font-medium">Active Goal Progress</p>
            <button onClick={() => onNavigate("goals")} className="text-xs text-jade-500 hover:text-jade-400 font-body transition-colors">
              Manage →
            </button>
          </div>
          <div className="space-y-3">
            {goals
              .filter((g) => g.status === "active")
              .slice(0, 4)
              .map((g) => {
                const progress = g.progress ?? calcGoalProgress(g.id, tasks);
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-ink-300 text-xs font-body truncate flex-1 mr-4">{g.title}</span>
                      <span className="text-jade-400 text-xs font-display font-medium flex-shrink-0">{progress}%</span>
                    </div>
                    <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          background: progress >= 75 ? "#22c55e" : progress >= 40 ? "#3D7A57" : "#F59E0B",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── 7-day chart ── */}
      <div className="bg-ink-800 border border-ink-700 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-ink-200 text-sm font-display font-medium">7-Day Task Completion</p>
          <button onClick={() => onNavigate("analytics")} className="text-xs text-jade-500 hover:text-jade-400 font-body transition-colors">
            Full analytics →
          </button>
        </div>
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-ink-700 text-xs font-body">Add tasks to see your progress chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3D7A57" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3D7A57" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#3D7A57"
                fill="url(#dashGrad)"
                strokeWidth={2}
                name="Completed"
                dot={{ r: 3, fill: "#3D7A57", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
