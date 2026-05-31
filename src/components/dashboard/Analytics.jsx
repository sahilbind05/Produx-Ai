import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { buildWeeklyData } from "../../utils/aiPlanner";

const ACCENT  = "#6366F1";
const AMBER   = "#F59E0B";
const EMERALD = "#10B981";
const RED     = "#EF4444";

function StatCard({ label, value, unit, sub, accent }) {
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-4">
      <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-2">{label}</p>
      <p className="text-2xl md:text-3xl font-bold" style={{ color: accent }}>
        {value}<span className="text-sm text-surface-400 ml-1">{unit}</span>
      </p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics({ tasks, goals, habits }) {
  const weeklyData      = buildWeeklyData(tasks);
  const completedTasks  = tasks.filter((t) => t.completed).length;
  const totalTasks      = tasks.length;
  const completionRate  = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeGoals     = goals.filter((g) => g.status === "active").length;
  const avgStreak       = habits.length
    ? Math.round(habits.reduce((a, h) => a + (h.streak || 0), 0) / habits.length)
    : 0;
  const weekTotal       = weeklyData.reduce((a, d) => a + d.completed, 0);

  const pieData = [
    { name: "Completed", value: goals.filter((g) => g.status === "completed").length },
    { name: "Active",    value: goals.filter((g) => g.status === "active").length },
    { name: "Paused",    value: goals.filter((g) => g.status === "paused").length },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = [EMERALD, ACCENT, AMBER];

  const priorityData = ["high", "medium", "low"].map((p) => ({
    name:  p.charAt(0).toUpperCase() + p.slice(1),
    total: tasks.filter((t) => t.priority === p).length,
    done:  tasks.filter((t) => t.priority === p && t.completed).length,
  }));

  const tooltipStyle = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "12px",
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-surface-900 dark:text-surface-100 font-bold text-xl">Analytics</h2>
        <p className="text-surface-500 text-sm mt-1">Your productivity at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Completion" value={completionRate} unit="%" sub={`${completedTasks}/${totalTasks} tasks`} accent={EMERALD} />
        <StatCard label="Active Goals" value={activeGoals} unit="" sub={`${goals.length} total`} accent={ACCENT} />
        <StatCard label="Avg Streak" value={avgStreak} unit="days" sub={`${habits.length} habits`} accent={AMBER} />
        <StatCard label="This Week" value={weekTotal} unit="done" sub="tasks completed" accent={RED} />
      </div>

      {/* Weekly area chart */}
      <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5 mb-4">
        <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold mb-4">Weekly Task Completion</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <defs>
              <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.2} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="completed" stroke={ACCENT} fill="url(#accentGrad)" strokeWidth={2} name="Completed"
              dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="total" stroke="#D1D5DB" fill="none" strokeWidth={1} strokeDasharray="4 2" name="Total" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority breakdown */}
        <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
          <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold mb-4">Tasks by Priority</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={priorityData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="done"  fill={ACCENT} radius={[4,4,0,0]} name="Completed" />
              <Bar dataKey="total" fill="#E5E7EB" radius={[4,4,0,0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goal status pie */}
        <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-5">
          <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold mb-4">Goal Status</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-surface-600 dark:text-surface-400">{d.name}</span>
                    </div>
                    <span className="text-surface-900 dark:text-surface-100 font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-surface-400">
              <p className="text-sm">No goal data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
