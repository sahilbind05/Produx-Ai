import { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/DashboardHome";
import GoalPanel from "../components/dashboard/GoalPanel";
import TaskPanel from "../components/dashboard/TaskPanel";
import HabitTracker from "../components/dashboard/HabitTracker";
import PomodoroTimer from "../components/dashboard/PomodoroTimer";
import Analytics from "../components/dashboard/Analytics";
import NotificationPanel from "../components/dashboard/NotificationPanel";
import { useGoals } from "../hooks/useGoals";
import { useTasks } from "../hooks/useTasks";
import { useHabits } from "../hooks/useHabits";
import { useNotifications } from "../hooks/useNotifications";
import { getAdaptiveSuggestions, calcGoalProgress } from "../utils/aiPlanner";

export default function Dashboard() {
  const [page, setPage] = useState("dashboard");

  const {
    tasks, loading: tl,
    create: createTask, toggle: toggleTask,
    edit: editTask, remove: removeTask,
  } = useTasks();

  const {
    goals, loading: gl,
    generating,
    create: createGoal,
    update: updateGoal,
    remove: removeGoal,
  } = useGoals();

  const {
    habits, loading: hl,
    create: createHabit, checkIn, remove: removeHabit,
  } = useHabits();

  const { notifications, unreadCount, markRead, push: pushNotif } = useNotifications();

  const goalsWithProgress = goals.map((g) => ({
    ...g,
    progress: calcGoalProgress(g.id, tasks),
  }));

  const dataReady = !tl && !gl && !hl;
  useEffect(() => {
    if (!dataReady) return;
    const suggestions = getAdaptiveSuggestions(goalsWithProgress, tasks, habits);
    suggestions.forEach((s) => {
      if (s.type === "success") return;
      const exists = notifications.some((n) => n.message === s.message);
      if (!exists) pushNotif(s.message, s.type);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]);

  const loading = tl || gl || hl;

  const pages = {
    dashboard: (
      <DashboardHome
        goals={goalsWithProgress} tasks={tasks} habits={habits}
        notifications={notifications} onNavigate={setPage} onToggleTask={toggleTask}
      />
    ),
    goals: (
      <GoalPanel
        goals={goalsWithProgress} tasks={tasks} generating={generating}
        onCreate={createGoal} onUpdate={updateGoal} onDelete={removeGoal}
      />
    ),
    tasks: (
      <TaskPanel
        tasks={tasks} goals={goalsWithProgress}
        onCreate={createTask} onToggle={toggleTask}
        onEdit={editTask} onDelete={removeTask}
      />
    ),
    habits: (
      <HabitTracker
        habits={habits} onCreate={createHabit}
        onCheckIn={checkIn} onDelete={removeHabit}
      />
    ),
    pomodoro: <PomodoroTimer />,
    analytics: <Analytics tasks={tasks} goals={goalsWithProgress} habits={habits} />,
  };

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors">
      <Sidebar active={page} onNavigate={setPage} unreadCount={unreadCount} />

      <main className="flex-1 overflow-y-auto min-w-0 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <NotificationPanel notifications={notifications} onMarkRead={markRead} />

        {/* Desktop top bar */}
        <div className="hidden lg:flex sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-slate-800 px-8 py-4 items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-surface-900 dark:text-surface-100 capitalize">{page}</h1>
            {generating.size > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-[11px] text-accent-600 dark:text-accent-400 font-medium">AI generating…</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-xs text-surface-500">{unreadCount} alert{unreadCount > 1 ? "s" : ""}</span>
              </div>
            )}
            <span className="text-xs text-surface-400">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 max-w-5xl lg:mx-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-accent-500 text-sm animate-pulse font-semibold">P</span>
                </div>
                <p className="text-surface-500 text-sm">Loading your workspace…</p>
              </div>
            </div>
          ) : (
            pages[page] || pages.dashboard
          )}
        </div>
      </main>
    </div>
  );
}
