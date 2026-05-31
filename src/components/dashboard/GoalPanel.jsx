import { useState, useMemo } from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { calcGoalProgress } from "../../utils/aiPlanner";

const STATUS = {
  active:    { cls: "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-500/30" },
  completed: { cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" },
  paused:    { cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" },
};

function DaysLeft({ targetDate }) {
  if (!targetDate) return null;
  const days = differenceInDays(parseISO(targetDate), new Date());
  if (days < 0)   return <span className="text-red-500 text-xs font-medium">⚠ {Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-amber-500 text-xs font-medium">Due today</span>;
  return <span className="text-surface-500 text-xs">{days}d left</span>;
}

function GoalCard({ goal, tasks, isGenerating, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const progress     = useMemo(() => calcGoalProgress(goal.id, tasks), [goal.id, tasks]);
  const linkedTasks  = tasks.filter((t) => t.goalId === goal.id);
  const doneTasks    = linkedTasks.filter((t) => t.completed);
  const overdueTasks = linkedTasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < format(new Date(), "yyyy-MM-dd")
  );
  const statusCls = STATUS[goal.status]?.cls || STATUS.active.cls;

  return (
    <div className={`bg-white dark:bg-slate-800/50 border rounded-xl transition-all
      ${goal.status === "completed" ? "border-surface-100 dark:border-slate-800 opacity-70" : "border-surface-200 dark:border-slate-700"}`}>
      <div className="p-4 md:p-5">

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium uppercase tracking-wide ${statusCls}`}>
                {goal.status}
              </span>
              {goal.category && (
                <span className="text-[11px] text-surface-400 capitalize">#{goal.category}</span>
              )}
              {isGenerating && (
                <span className="text-[11px] text-accent-500 font-medium flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                  AI generating…
                </span>
              )}
            </div>
            <h3 className="text-surface-900 dark:text-surface-100 text-sm font-semibold leading-snug">{goal.title}</h3>
            {goal.description && (
              <p className="text-surface-500 text-xs mt-1 leading-relaxed line-clamp-2">{goal.description}</p>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onUpdate(goal.id, { status: goal.status === "completed" ? "active" : "completed" })}
              className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
              {goal.status === "completed" ? "↺" : "✓"}
            </button>
            <button onClick={() => onUpdate(goal.id, { status: goal.status === "paused" ? "active" : "paused" })}
              className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10">
              {goal.status === "paused" ? "▶" : "⏸"}
            </button>
            <button onClick={() => onDelete(goal.id)}
              className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-surface-500">
              {isGenerating ? "Generating AI tasks…" : `${doneTasks.length}/${linkedTasks.length} tasks`}
            </span>
            <span className="text-xs font-semibold text-accent-500">{progress}%</span>
          </div>
          <div className="h-2 bg-surface-100 dark:bg-slate-700 rounded-full overflow-hidden">
            {isGenerating ? (
              <div className="h-full w-full bg-accent-300/40 dark:bg-accent-500/30 animate-pulse rounded-full" />
            ) : (
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: progress >= 75 ? "#10b981" : progress >= 40 ? "#6366f1" : "#f59e0b" }} />
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DaysLeft targetDate={goal.targetDate} />
            {overdueTasks.length > 0 && (
              <span className="text-red-500 text-xs font-medium">{overdueTasks.length} overdue</span>
            )}
          </div>
          {linkedTasks.length > 0 && !isGenerating && (
            <button onClick={() => setExpanded((v) => !v)}
              className="text-xs text-surface-500 hover:text-accent-500 transition-colors py-1 px-2 rounded-lg hover:bg-surface-50 dark:hover:bg-slate-700">
              {expanded ? "▲ Hide" : `▼ ${linkedTasks.length} tasks`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable tasks */}
      {expanded && linkedTasks.length > 0 && (
        <div className="border-t border-surface-200 dark:border-slate-700 px-4 pb-4 pt-3">
          <p className="text-[11px] text-surface-400 uppercase tracking-wider font-medium mb-2">Linked Tasks</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {linkedTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${t.completed ? "bg-accent-500 border-accent-500" : "border-surface-300 dark:border-slate-600"}`}>
                  {t.completed && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={`text-xs flex-1 min-w-0 truncate
                  ${t.completed ? "line-through text-surface-400" : "text-surface-700 dark:text-surface-300"}`}>
                  {t.title}
                </span>
                {t.aiGenerated && <span className="text-[10px] text-accent-400 font-medium flex-shrink-0">AI</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GoalPanel({ goals, tasks = [], generating = new Set(), onCreate, onUpdate, onDelete }) {
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [aiStatus,     setAiStatus]     = useState("");
  const [taskPreview,  setTaskPreview]  = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error,        setError]        = useState("");
  const [form, setForm] = useState({ title: "", description: "", targetDate: "", category: "learning" });

  const today         = format(new Date(), "yyyy-MM-dd");
  const filtered      = goals.filter((g) => filterStatus === "all" ? true : g.status === filterStatus);
  const activeCount   = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.targetDate && form.targetDate < today) { setError("Target date cannot be in the past."); return; }
    setSaving(true); setAiStatus("generating"); setError("");
    try {
      const result = await onCreate(form);
      setTaskPreview(result?.taskCount || null);
      setAiStatus("done");
      setForm({ title: "", description: "", targetDate: "", category: "learning" });
      setShowForm(false);
    } catch (err) {
      setAiStatus("error"); setError(err.message || "Failed to create goal.");
    } finally { setSaving(false); }
  };

  const CATEGORIES = ["learning","work","health","fitness","personal","finance","creative"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-surface-900 dark:text-surface-100 font-bold text-xl">Goals</h2>
          <p className="text-surface-500 text-sm mt-1">
            <span className="text-accent-500 font-medium">{activeCount}</span> active ·{" "}
            <span className="text-emerald-500 font-medium">{completedCount}</span> completed
          </p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setError(""); setAiStatus(""); }}
          className={`text-sm px-4 py-2 rounded-lg transition-all font-medium
            ${showForm ? "bg-surface-100 dark:bg-slate-700 text-surface-600 dark:text-surface-300" : "bg-accent-500 hover:bg-accent-600 text-white shadow-sm"}`}>
          {showForm ? "✕ Cancel" : "+ New Goal"}
        </button>
      </div>

      {/* AI status banners */}
      {aiStatus === "generating" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 rounded-xl mb-4">
          <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse flex-shrink-0" />
          <p className="text-accent-600 dark:text-accent-400 text-sm">AI is generating your task plan…</p>
        </div>
      )}
      {aiStatus === "done" && taskPreview !== null && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl mb-4">
          <span className="text-emerald-500 text-sm">✓</span>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm flex-1">{taskPreview} tasks generated — see Tasks tab</p>
          <button onClick={() => setAiStatus("")} className="text-surface-400 hover:text-surface-600 text-sm">×</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800/50 border border-accent-200 dark:border-accent-500/20 rounded-xl p-4 md:p-5 mb-5 space-y-3">
          <p className="text-accent-500 text-xs font-medium tracking-wide uppercase">New Goal</p>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-2.5 rounded-lg">{error}</p>
          )}

          <input autoFocus value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Goal title (e.g. Learn DSA in 30 days)" required
            className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />

          <textarea value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your goal in detail for better AI tasks…"
            rows={3}
            className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none transition-all" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-surface-500 font-medium block mb-1.5">Target Date</label>
              <input type="date" value={form.targetDate} min={today}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
            </div>
            <div>
              <label className="text-xs text-surface-500 font-medium block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-3 py-2.5 outline-none">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {form.targetDate && (
            <div className="flex items-start gap-2 px-4 py-3 bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 rounded-lg">
              <span className="text-accent-500 text-sm mt-0.5">✦</span>
              <p className="text-accent-600 dark:text-accent-400 text-xs">
                AI will generate specific daily tasks for {differenceInDays(parseISO(form.targetDate), new Date())} days
              </p>
            </div>
          )}

          <button type="submit" disabled={saving || !form.title.trim()}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating AI task plan…
              </>
            ) : (
              <>✦ Create Goal + Generate AI Tasks</>
            )}
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {[
          { id: "all",       label: `All (${goals.length})` },
          { id: "active",    label: `Active (${activeCount})` },
          { id: "completed", label: `Done (${completedCount})` },
          { id: "paused",    label: "Paused" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilterStatus(f.id)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all font-medium
              ${filterStatus === f.id
                ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-500/30"
                : "text-surface-500 border-transparent hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-slate-800"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <div className="text-4xl mb-3 opacity-40">◎</div>
          <p className="text-sm font-medium text-surface-500">
            {filterStatus === "all" ? "No goals yet" : `No ${filterStatus} goals`}
          </p>
          {filterStatus === "all" && (
            <p className="text-xs text-surface-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Create a goal with a target date and AI builds your task plan automatically.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <GoalCard key={g.id} goal={g} tasks={tasks}
              isGenerating={generating.has(g.id)}
              onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
