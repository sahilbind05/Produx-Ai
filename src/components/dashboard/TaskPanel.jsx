import { useState, useMemo } from "react";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";

const PRIORITY = {
  high:   { label: "High",   cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" },
  medium: { label: "Med",    cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30" },
  low:    { label: "Low",    cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30" },
};

function formatDateHeader(dateStr) {
  if (!dateStr) return "No Date";
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

function TaskItem({ task, goals, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title, priority: task.priority || "medium", dueDate: task.dueDate || "",
  });

  const p         = PRIORITY[task.priority] || PRIORITY.medium;
  const goal      = goals.find((g) => g.id === task.goalId);
  const today     = format(new Date(), "yyyy-MM-dd");
  const isOverdue = task.dueDate && task.dueDate < today && !task.completed;

  const saveEdit = async () => {
    if (!draft.title.trim()) return;
    await onEdit(task.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-surface-50 dark:bg-slate-700/50 border border-accent-200 dark:border-accent-500/30 rounded-xl p-4">
        <input autoFocus value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          className="w-full bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 mb-3 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
        <div className="flex gap-2 mb-3">
          <select value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
            className="flex-1 bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-xs rounded-lg px-3 py-2.5 outline-none">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="date" value={draft.dueDate}
            onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
            className="flex-1 bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-xs rounded-lg px-3 py-2.5 outline-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={saveEdit}
            className="flex-1 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-xs rounded-lg font-medium transition-colors">Save</button>
          <button onClick={() => setEditing(false)}
            className="px-4 border border-surface-200 dark:border-slate-600 text-surface-500 text-xs rounded-lg transition-colors hover:bg-surface-50 dark:hover:bg-slate-700">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all
      ${task.completed ? "bg-surface-50/50 dark:bg-slate-800/30 border-surface-100 dark:border-slate-800 opacity-60"
        : isOverdue ? "bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
        : "bg-white dark:bg-slate-800/50 border-surface-200 dark:border-slate-700 hover:border-surface-300 dark:hover:border-slate-600"}`}>

      <button onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${task.completed ? "bg-accent-500 border-accent-500 text-white" : "border-surface-300 dark:border-slate-600 hover:border-accent-400"}`}>
        {task.completed && <span className="text-[10px]">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug
          ${task.completed ? "line-through text-surface-400" : isOverdue ? "text-red-600 dark:text-red-400" : "text-surface-800 dark:text-surface-100"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${p.cls}`}>{p.label}</span>
          {goal && (
            <span className="text-[11px] text-accent-500 truncate max-w-[120px]">◎ {goal.title}</span>
          )}
          {task.aiGenerated && <span className="text-[10px] text-accent-400 font-medium">AI</span>}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {!task.completed && (
          <button onClick={() => setEditing(true)}
            className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-accent-500 text-xs rounded-lg hover:bg-surface-100 dark:hover:bg-slate-700 transition-all">✎</button>
        )}
        <button onClick={() => onDelete(task.id)}
          className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-red-500 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">×</button>
      </div>
    </div>
  );
}

export default function TaskPanel({ tasks, goals = [], onCreate, onToggle, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [search,   setSearch]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    title: "", priority: "medium", dueDate: format(new Date(), "yyyy-MM-dd"), goalId: "",
  });

  const today          = format(new Date(), "yyyy-MM-dd");
  const completedToday = tasks.filter((t) => t.completed && t.dueDate === today).length;
  const totalToday     = tasks.filter((t) => t.dueDate === today).length;
  const overdueCount   = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;

  // Filter tasks
  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === "active")    return !t.completed;
        if (filter === "completed") return t.completed;
        if (filter === "today")     return t.dueDate === today;
        if (filter === "overdue")   return !t.completed && t.dueDate < today;
        if (filter === "high")      return t.priority === "high" && !t.completed;
        if (filter === "ai")        return t.aiGenerated;
        return true;
      })
      .filter((t) => goalFilter === "all" || t.goalId === goalFilter)
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, filter, goalFilter, search, today]);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups = {};

    // Sort tasks by date (no date goes last)
    const sorted = [...filtered].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    sorted.forEach((task) => {
      const dateKey = task.dueDate || "no-date";
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });

    return groups;
  }, [filtered]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onCreate(form);
      setForm({ title: "", priority: "medium", dueDate: today, goalId: "" });
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const filterTabs = [
    { id: "all",       label: `All (${tasks.length})` },
    { id: "today",     label: `Today (${totalToday})` },
    { id: "active",    label: "Active" },
    { id: "overdue",   label: `Overdue${overdueCount > 0 ? ` (${overdueCount})` : ""}`, danger: overdueCount > 0 },
    { id: "completed", label: "Done" },
    { id: "high",      label: "⚑ High" },
    { id: "ai",        label: "✦ AI" },
  ];

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-surface-900 dark:text-surface-100 font-bold text-xl">Tasks</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-surface-500 text-sm">
              <span className="text-accent-500 font-medium">{completedToday}</span>
              <span className="text-surface-400">/{totalToday} today</span>
            </p>
            {overdueCount > 0 && (
              <p className="text-red-500 text-sm font-medium">{overdueCount} overdue</p>
            )}
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className={`text-sm px-4 py-2 rounded-lg transition-all font-medium
            ${showForm ? "bg-surface-100 dark:bg-slate-700 text-surface-600 dark:text-surface-300" : "bg-accent-500 hover:bg-accent-600 text-white shadow-sm"}`}>
          {showForm ? "✕ Cancel" : "+ Task"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800/50 border border-accent-200 dark:border-accent-500/20 rounded-xl p-4 mb-5 space-y-3">
          <input autoFocus value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What needs to be done?" required
            className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              className="bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none" />
            <select value={form.goalId} onChange={(e) => setForm((p) => ({ ...p, goalId: e.target.value }))}
              className="col-span-2 md:col-span-1 bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none">
              <option value="">No goal</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving || !form.title.trim()}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-sm">
            {saving ? "Adding…" : "Add Task"}
          </button>
        </form>
      )}

      {/* Search + Goal filter */}
      <div className="flex gap-2 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="flex-1 bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 placeholder:text-surface-400 transition-all" />
        <select
          value={goalFilter}
          onChange={(e) => setGoalFilter(e.target.value)}
          className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none min-w-[140px]">
          <option value="all">All Goals</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>◎ {g.title}</option>
          ))}
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {filterTabs.map((tab) => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all font-medium whitespace-nowrap flex-shrink-0
              ${filter === tab.id
                ? tab.danger
                  ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30"
                  : "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-500/30"
                : tab.danger
                  ? "text-red-500/70 border-transparent"
                  : "text-surface-500 border-transparent hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-slate-800"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list grouped by date */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-surface-400">
          <div className="text-3xl mb-2 opacity-40">☐</div>
          <p className="text-sm font-medium text-surface-500">{search ? "No tasks match" : "No tasks here"}</p>
          {filter === "all" && !search && (
            <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-accent-500 hover:text-accent-600 font-medium">
              Add your first task →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  {formatDateHeader(dateKey === "no-date" ? null : dateKey)}
                </h3>
                <div className="flex-1 h-px bg-surface-200 dark:bg-slate-700" />
                <span className="text-xs text-surface-400">
                  {dateTasks.filter(t => t.completed).length}/{dateTasks.length}
                </span>
              </div>

              {/* Tasks for this date */}
              <div className="space-y-2">
                {dateTasks.map((t) => (
                  <TaskItem key={t.id} task={t} goals={goals}
                    onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-surface-400 pt-3">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
