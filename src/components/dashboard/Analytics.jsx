import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { buildWeeklyData } from "../../utils/aiPlanner";
import { format, subDays } from "date-fns";

const JADE  = "#3D7A57";
const AMBER = "#F59E0B";
const SKY   = "#0EA5E9";
const ROSE  = "#F43F5E";

const tooltipStyle = {
  backgroundColor: "#1A1A1A", border: "0.5px solid #333",
  borderRadius: "2px", color: "#F0EFEB", fontSize: "12px", fontFamily: "DM Sans",
};

function StatCard({ label, value, unit, sub, accent }) {
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-sm p-4">
      <p className="text-[11px] text-ink-500 uppercase tracking-widest font-display mb-2">{label}</p>
      <p className="font-display text-3xl font-bold" style={{ color: accent }}>
        {value}<span className="text-base text-ink-500 ml-1 font-body">{unit}</span>
      </p>
      {sub && <p className="text-xs text-ink-600 mt-1 font-body">{sub}</p>}
    </div>
  );
}

export default function Analytics({ tasks, goals, habits }) {
  const weeklyData = buildWeeklyData(tasks);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeGoals  = goals.filter((g) => g.status === "active").length;
  const avgStreak    = habits.length ? Math.round(habits.reduce((a, h) => a + (h.streak || 0), 0) / habits.length) : 0;

  // Goal progress pie
  const pieData = [
    { name: "Completed", value: goals.filter((g) => g.status === "completed").length },
    { name: "Active",    value: goals.filter((g) => g.status === "active").length },
    { name: "Paused",    value: goals.filter((g) => g.status === "paused").length },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = [JADE, SKY, AMBER];

  // Priority breakdown
  const priorityData = ["high", "medium", "low"].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    total: tasks.filter((t) => t.priority === p).length,
    done:  tasks.filter((t) => t.priority === p && t.completed).length,
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-ink-100 font-display font-bold text-lg">Analytics</h2>
        <p className="text-ink-500 text-xs font-body mt-0.5">Your productivity at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Completion Rate" value={completionRate} unit="%" sub={`${completedTasks}/${totalTasks} tasks`} accent={JADE} />
        <StatCard label="Active Goals" value={activeGoals} unit="" sub={`${goals.length} total goals`} accent={SKY} />
        <StatCard label="Avg Habit Streak" value={avgStreak} unit="days" sub={`${habits.length} habits tracked`} accent={AMBER} />
        <StatCard label="This Week" value={weeklyData.reduce((a, d) => a + d.completed, 0)} unit="done" sub="tasks completed" accent={ROSE} />
      </div>

      {/* Weekly area chart */}
      <div className="bg-ink-800 border border-ink-700 rounded-sm p-4 mb-4">
        <p className="text-ink-300 text-sm font-display font-medium mb-4">Weekly Task Completion</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="jadeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={JADE} stopOpacity={0.3} />
                <stop offset="95%" stopColor={JADE} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#888", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="completed" stroke={JADE} fill="url(#jadeGrad)" strokeWidth={2} name="Completed" />
            <Area type="monotone" dataKey="total"     stroke="#333" fill="none" strokeWidth={1} strokeDasharray="4 2" name="Total" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority breakdown */}
        <div className="bg-ink-800 border border-ink-700 rounded-sm p-4">
          <p className="text-ink-300 text-sm font-display font-medium mb-4">Tasks by Priority</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={priorityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#888", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#888", fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="done"  fill={JADE}  radius={[2,2,0,0]} name="Completed" />
              <Bar dataKey="total" fill="#333"  radius={[2,2,0,0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goal status pie */}
        <div className="bg-ink-800 border border-ink-700 rounded-sm p-4">
          <p className="text-ink-300 text-sm font-display font-medium mb-4">Goal Status</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                    dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs font-body">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-ink-400">{d.name}</span>
                    </div>
                    <span className="text-ink-200 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-ink-600">
              <p className="text-sm font-display">No goal data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
