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

  // Enrich goals with live progress
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
    <div className="flex min-h-screen bg-ink-900 font-body">
      {/* Sidebar (desktop) + mobile top bar + bottom tabs */}
      <Sidebar active={page} onNavigate={setPage} unreadCount={unreadCount} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0
        pt-14 pb-20          
        lg:pt-0 lg:pb-0">

        {/* Notification toasts */}
        <NotificationPanel notifications={notifications} onMarkRead={markRead} />

        {/* Desktop top bar */}
        <div className="hidden lg:flex sticky top-0 z-40 bg-ink-900/95 backdrop-blur border-b border-ink-800 px-8 py-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-base font-semibold text-ink-200 capitalize">{page}</h1>
            {generating.size > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-jade-600/10 border border-jade-600/20 rounded-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
                <span className="text-[11px] text-jade-400 font-body">AI generating…</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
                <span className="text-xs text-ink-500 font-body">{unreadCount} alert{unreadCount > 1 ? "s" : ""}</span>
              </div>
            )}
            <span className="text-xs text-ink-600 font-body">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 max-w-5xl lg:mx-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-7 h-7 border border-jade-500 flex items-center justify-center mx-auto mb-3">
                  <span className="text-jade-500 text-xs animate-pulse">◈</span>
                </div>
                <p className="text-ink-600 text-xs font-body">Loading your workspace…</p>
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
