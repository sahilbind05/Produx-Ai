import { useState } from "react";
import { format } from "date-fns";

const PRIORITY = {
  high:   { label: "High",   cls: "text-rose-400  bg-rose-500/10  border-rose-500/30"  },
  medium: { label: "Medium", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  low:    { label: "Low",    cls: "text-sky-400   bg-sky-500/10   border-sky-500/30"   },
};

// ── Single task row with inline edit ──────────────────────────────────────
function TaskItem({ task, goals, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({
    title:    task.title,
    priority: task.priority || "medium",
    dueDate:  task.dueDate  || "",
  });

  const p    = PRIORITY[task.priority] || PRIORITY.medium;
  const goal = goals.find((g) => g.id === task.goalId);
  const today = format(new Date(), "yyyy-MM-dd");
  const isOverdue = task.dueDate && task.dueDate < today && !task.completed;

  const saveEdit = async () => {
    if (!draft.title.trim()) return;
    await onEdit(task.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-ink-700 border border-jade-600/40 rounded-sm p-3">
        <input
          autoFocus
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
          className="w-full bg-ink-600 border border-ink-500 text-ink-100 text-sm rounded-sm px-3 py-1.5 mb-2 outline-none focus:border-jade-500 font-body"
        />
        <div className="flex gap-2 mb-2">
          <select
            value={draft.priority}
            onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
            className="flex-1 bg-ink-600 border border-ink-500 text-ink-100 text-xs rounded-sm px-2 py-1.5 outline-none focus:border-jade-500 font-body"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
            className="flex-1 bg-ink-600 border border-ink-500 text-ink-100 text-xs rounded-sm px-2 py-1.5 outline-none focus:border-jade-500 font-body"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={saveEdit}
            className="flex-1 py-1.5 bg-jade-600 hover:bg-jade-500 text-white text-xs rounded-sm font-display transition-colors">
            Save
          </button>
          <button onClick={() => setEditing(false)}
            className="px-3 border border-ink-500 text-ink-400 text-xs rounded-sm font-body hover:text-ink-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-sm border transition-all group
      ${task.completed
        ? "bg-ink-800/40 border-ink-800 opacity-55"
        : isOverdue
          ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
          : "bg-ink-800 border-ink-700 hover:border-ink-600"}`}>

      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-all
          ${task.completed
            ? "bg-jade-600 border-jade-600 text-white"
            : "border-ink-500 hover:border-jade-500"}`}>
        {task.completed && <span className="text-[10px]">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-body leading-snug
          ${task.completed ? "line-through text-ink-600" : isOverdue ? "text-rose-300" : "text-ink-100"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-display ${p.cls}`}>
            {p.label}
          </span>
          {task.dueDate && (
            <span className={`text-[10px] font-body ${isOverdue ? "text-rose-400 font-medium" : "text-ink-500"}`}>
              {isOverdue ? "⚠ Overdue · " : ""}{task.dueDate}
            </span>
          )}
          {goal && (
            <span className="text-[10px] text-jade-600 font-body truncate max-w-[120px]">
              ◎ {goal.title}
            </span>
          )}
          {task.aiGenerated && (
            <span className="text-[10px] text-jade-700 font-body">◈ AI</span>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!task.completed && (
          <button onClick={() => setEditing(true)}
            className="text-ink-500 hover:text-jade-400 text-xs px-1 py-0.5 transition-colors"
            title="Edit task">
            ✎
          </button>
        )}
        <button onClick={() => onDelete(task.id)}
          className="text-ink-500 hover:text-rose-400 text-xs px-1 py-0.5 transition-colors"
          title="Delete task">
          ×
        </button>
      </div>
    </div>
  );
}

// ── Task Panel ─────────────────────────────────────────────────────────────
export default function TaskPanel({ tasks, goals = [], onCreate, onToggle, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    title: "", priority: "medium", dueDate: format(new Date(), "yyyy-MM-dd"), goalId: "",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  // Counts
  const completedToday = tasks.filter((t) => t.completed && t.dueDate === today).length;
  const totalToday     = tasks.filter((t) => t.dueDate === today).length;
  const overdueCount   = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;

  // Filter + search
  const filtered = tasks
    .filter((t) => {
      if (filter === "active")    return !t.completed;
      if (filter === "completed") return t.completed;
      if (filter === "today")     return t.dueDate === today;
      if (filter === "overdue")   return !t.completed && t.dueDate < today;
      if (filter === "high")      return t.priority === "high" && !t.completed;
      if (filter === "ai")        return t.aiGenerated;
      return true;
    })
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onCreate(form);
      setForm({ title: "", priority: "medium", dueDate: today, goalId: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const filterTabs = [
    { id: "all",       label: `All (${tasks.length})` },
    { id: "today",     label: `Today (${totalToday})` },
    { id: "active",    label: "Active" },
    { id: "overdue",   label: `Overdue${overdueCount > 0 ? ` (${overdueCount})` : ""}`, danger: overdueCount > 0 },
    { id: "completed", label: "Done" },
    { id: "high",      label: "⚑ High" },
    { id: "ai",        label: "◈ AI" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-ink-100 font-display font-bold text-lg">Tasks</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-ink-500 text-xs font-body">
              <span className="text-jade-400 font-medium">{completedToday}</span>
              <span className="text-ink-600">/{totalToday}</span>
              <span className="text-ink-600"> completed today</span>
            </p>
            {overdueCount > 0 && (
              <p className="text-rose-400 text-xs font-body">
                {overdueCount} overdue
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-sm transition-colors font-display
            ${showForm
              ? "bg-ink-700 text-ink-300 border border-ink-600"
              : "bg-jade-600 hover:bg-jade-500 text-white"}`}
        >
          {showForm ? "✕ Cancel" : "+ Add Task"}
        </button>
      </div>

      {/* Add task form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-ink-800 border border-jade-600/30 rounded-sm p-4 mb-5 space-y-3"
        >
          <p className="text-jade-400 text-[11px] font-display tracking-widest uppercase">New Task</p>

          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What needs to be done?"
            required
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body"
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              className="bg-ink-700 border border-ink-600 text-ink-100 text-xs rounded-sm px-2 py-2 outline-none focus:border-jade-500 font-body"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="bg-ink-700 border border-ink-600 text-ink-100 text-xs rounded-sm px-2 py-2 outline-none focus:border-jade-500 font-body"
            />
            <select
              value={form.goalId}
              onChange={(e) => setForm((p) => ({ ...p, goalId: e.target.value }))}
              className="bg-ink-700 border border-ink-600 text-ink-100 text-xs rounded-sm px-2 py-2 outline-none focus:border-jade-500 font-body"
            >
              <option value="">No goal</option>
              {goals.filter((g) => g.status === "active").map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex-1 py-2 bg-jade-600 hover:bg-jade-500 disabled:opacity-50 text-white text-sm rounded-sm font-display transition-colors"
            >
              {saving ? "Adding…" : "Add Task"}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-ink-800 border border-ink-700 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body placeholder:text-ink-600"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-[11px] px-2.5 py-1 rounded-sm transition-all font-display border
              ${filter === tab.id
                ? tab.danger
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-jade-600/20 text-jade-400 border-jade-600/30"
                : tab.danger
                  ? "text-rose-400/70 border-transparent hover:text-rose-400"
                  : "text-ink-500 border-transparent hover:text-ink-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-ink-600">
          <div className="text-2xl mb-2">◻</div>
          <p className="text-sm font-display">
            {search ? "No tasks match your search" : "No tasks here"}
          </p>
          {filter === "all" && !search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-jade-500 hover:text-jade-400 font-body transition-colors"
            >
              Add your first task →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
          {filtered.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              goals={goals}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          <p className="text-center text-[11px] text-ink-700 pt-2 font-body">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
