// ─── AI Planning Engine (Rule-Based) ──────────────────────────────────────
// Pure functions — no ML. All logic runs client-side.

import { format, addDays, differenceInDays, parseISO, startOfDay } from "date-fns";

// ── Break a goal into daily AI tasks ─────────────────────────────────────
export function breakGoalIntoTasks(goal) {
  const { title, targetDate } = goal;
  const today    = startOfDay(new Date());
  const deadline = startOfDay(parseISO(targetDate));
  const daysLeft = Math.max(1, differenceInDays(deadline, today));

  // Cap at 14 AI tasks so we don't flood the task list
  const MAX_TASKS = Math.min(daysLeft, 14);

  const phases = [
    { label: "Research & Planning", pct: 0.20 },
    { label: "Core Execution",      pct: 0.60 },
    { label: "Review & Polish",     pct: 0.20 },
  ];

  const tasks = [];
  let dayOffset = 0;

  for (const { label, pct } of phases) {
    const phaseDays = Math.max(1, Math.round(MAX_TASKS * pct));
    for (let i = 0; i < phaseDays; i++) {
      if (tasks.length >= MAX_TASKS) break;
      tasks.push({
        title:       `[${label}] ${title}`,
        goalId:      goal.id || null,
        dueDate:     format(addDays(today, dayOffset), "yyyy-MM-dd"),
        priority:    i === 0 ? "high" : "medium",
        completed:   false,
        aiGenerated: true,
      });
      dayOffset = Math.min(dayOffset + Math.floor(daysLeft / MAX_TASKS), daysLeft - 1);
    }
  }

  return tasks;
}

// ── Suggest up to 5 tasks to focus on today ───────────────────────────────
// Fixed: removed duplicate — todayTasks ⊂ pending, so don't merge both
export function suggestTodaysTasks(goals, tasks) {
  const today = format(new Date(), "yyyy-MM-dd");

  // Today's incomplete tasks first
  const todayPending = tasks
    .filter((t) => !t.completed && t.dueDate === today)
    .sort((a, b) => priorityWeight(a) - priorityWeight(b));

  if (todayPending.length >= 5) return todayPending.slice(0, 5);

  // Fill with overdue high-priority tasks (not duplicating today's)
  const todayIds = new Set(todayPending.map((t) => t.id));
  const overdue  = tasks
    .filter((t) => !t.completed && t.dueDate < today && !todayIds.has(t.id))
    .sort((a, b) => priorityWeight(a) - priorityWeight(b));

  return [...todayPending, ...overdue].slice(0, 5);
}

function priorityWeight(t) {
  return { high: 0, medium: 1, low: 2 }[t.priority] ?? 1;
}

// ── Calculate goal progress from its linked tasks ─────────────────────────
export function calcGoalProgress(goalId, tasks) {
  if (!goalId) return 0;
  const linked = tasks.filter((t) => t.goalId === goalId);
  if (linked.length === 0) return 0;
  const done = linked.filter((t) => t.completed).length;
  return Math.round((done / linked.length) * 100);
}

// ── Adaptive suggestions shown on Dashboard ───────────────────────────────
export function getAdaptiveSuggestions(goals, tasks, habits) {
  const suggestions = [];
  const today = format(new Date(), "yyyy-MM-dd");

  // Overdue tasks
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today);
  if (overdue.length > 0) {
    suggestions.push({
      type: "warning",
      message: `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Prioritize or reschedule them today.`,
    });
  }

  // Habit streak risk
  const atRisk = habits.filter((h) => {
    const dates = h.completedDates || [];
    if (dates.length === 0) return true;
    const lastDate = [...dates].sort().reverse()[0];
    return differenceInDays(new Date(), parseISO(lastDate)) >= 2;
  });
  if (atRisk.length > 0) {
    suggestions.push({
      type: "info",
      message: `${atRisk.length} habit${atRisk.length > 1 ? "s are" : " is"} about to break their streak. Check in now!`,
    });
  }

  // Goals near deadline with low progress
  for (const g of goals) {
    if (!g.targetDate || g.status !== "active") continue;
    const daysLeft = differenceInDays(parseISO(g.targetDate), new Date());
    const progress = calcGoalProgress(g.id, tasks);
    if (daysLeft >= 0 && daysLeft <= 7 && progress < 50) {
      suggestions.push({
        type: "urgent",
        message: `"${g.title}" is due in ${daysLeft === 0 ? "today" : `${daysLeft} day${daysLeft > 1 ? "s" : ""}`} with ${progress}% done.`,
      });
    }
  }

  // Positive reinforcement
  const doneToday = tasks.filter(
    (t) => t.completed && t.dueDate === today
  ).length;
  if (doneToday >= 3) {
    suggestions.push({
      type: "success",
      message: `Excellent! You completed ${doneToday} tasks today. Keep the momentum going.`,
    });
  }

  // No activity nudge
  if (tasks.length === 0) {
    suggestions.push({
      type: "info",
      message: "Start by creating a goal — the AI will generate daily tasks for you automatically.",
    });
  }

  return suggestions.slice(0, 4);
}

// ── Build 7-day chart data ────────────────────────────────────────────────
export function buildWeeklyData(tasks) {
  return Array.from({ length: 7 }, (_, i) => {
    const day   = addDays(new Date(), i - 6);
    const date  = format(day, "yyyy-MM-dd");
    const label = format(day, "EEE");
    const completed = tasks.filter((t) => t.completed && t.dueDate === date).length;
    const total     = tasks.filter((t) => t.dueDate === date).length;
    return {
      day: label,
      date,
      completed,
      total,
      rate: total ? Math.round((completed / total) * 100) : 0,
    };
  });
}

// ── Compute consecutive habit streak ─────────────────────────────────────
export function computeStreak(completedDates = []) {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let cursor = startOfDay(new Date());

  for (const dateStr of sorted) {
    const d    = startOfDay(parseISO(dateStr));
    const diff = differenceInDays(cursor, d);
    if (diff <= 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }
  return streak;
}
