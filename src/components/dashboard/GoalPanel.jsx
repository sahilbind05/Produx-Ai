import { useState, useMemo } from "react";
import { differenceInDays, parseISO, format } from "date-fns";
import { calcGoalProgress } from "../../utils/aiPlanner";

const STATUS = {
  active:    { cls: "bg-jade-600/20  text-jade-400  border-jade-600/30"  },
  completed: { cls: "bg-sky-500/20   text-sky-400   border-sky-500/30"   },
  paused:    { cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

function DaysLeft({ targetDate }) {
  if (!targetDate) return null;
  const days = differenceInDays(parseISO(targetDate), new Date());
  if (days < 0)   return <span className="text-rose-400 text-[10px] font-body">⚠ {Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-amber-400 text-[10px] font-body">Due today</span>;
  return <span className="text-ink-500 text-[10px] font-body">{days}d left</span>;
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
    <div className={`bg-ink-800 border rounded-sm transition-all
      ${goal.status === "completed" ? "border-ink-800 opacity-70" : "border-ink-700"}`}>
      <div className="p-3.5 md:p-4">

        {/* Header row */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-display uppercase tracking-wider ${statusCls}`}>
                {goal.status}
              </span>
              {goal.category && (
                <span className="text-[10px] text-ink-600 font-body capitalize">#{goal.category}</span>
              )}
              {isGenerating && (
                <span className="text-[10px] text-jade-400 font-body flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse" />
                  AI generating…
                </span>
              )}
            </div>
            <h3 className="text-ink-100 text-sm font-display font-semibold leading-snug">{goal.title}</h3>
            {goal.description && (
              <p className="text-ink-500 text-xs mt-1 font-body leading-relaxed line-clamp-2">{goal.description}</p>
            )}
          </div>

          {/* Action buttons — larger tap targets on mobile */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onUpdate(goal.id, {
                status: goal.status === "completed" ? "active" : "completed",
              })}
              className="w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-ink-500 hover:text-jade-400 transition-colors rounded-sm hover:bg-jade-600/10">
              {goal.status === "completed" ? "↺" : "✓"}
            </button>
            <button onClick={() => onUpdate(goal.id, {
                status: goal.status === "paused" ? "active" : "paused",
              })}
              className="w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-ink-500 hover:text-amber-400 transition-colors rounded-sm hover:bg-amber-500/10">
              {goal.status === "paused" ? "▶" : "⏸"}
            </button>
            <button onClick={() => onDelete(goal.id)}
              className="w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-ink-500 hover:text-rose-400 transition-colors rounded-sm hover:bg-rose-500/10">
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-ink-500 font-body">
              {isGenerating ? "Generating AI tasks…" : `${doneTasks.length}/${linkedTasks.length} tasks`}
            </span>
            <span className="text-[11px] font-display font-medium text-jade-400">{progress}%</span>
          </div>
          <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
            {isGenerating ? (
              <div className="h-full w-full bg-jade-600/40 animate-pulse rounded-full" />
            ) : (
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: progress >= 75 ? "#22c55e" : progress >= 40 ? "#3D7A57" : "#F59E0B" }} />
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DaysLeft targetDate={goal.targetDate} />
            {overdueTasks.length > 0 && (
              <span className="text-rose-400 text-[10px] font-body">{overdueTasks.length} overdue</span>
            )}
          </div>
          {linkedTasks.length > 0 && !isGenerating && (
            <button onClick={() => setExpanded((v) => !v)}
              className="text-[11px] text-ink-500 hover:text-jade-400 font-body transition-colors py-1 px-2">
              {expanded ? "▲ Hide" : `▼ ${linkedTasks.length} tasks`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable tasks */}
      {expanded && linkedTasks.length > 0 && (
        <div className="border-t border-ink-700 px-3.5 pb-3 pt-3">
          <p className="text-[10px] text-ink-600 uppercase tracking-widest font-display mb-2">Linked Tasks</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {linkedTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0
                  ${t.completed ? "bg-jade-600 border-jade-600" : "border-ink-500"}`}>
                  {t.completed && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={`text-xs font-body flex-1 min-w-0 truncate
                  ${t.completed ? "line-through text-ink-600" : "text-ink-300"}`}>
                  {t.title}
                </span>
                {t.aiGenerated && <span className="text-[9px] text-jade-700 flex-shrink-0">◈</span>}
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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-ink-100 font-display font-bold text-lg">Goals</h2>
          <p className="text-ink-500 text-xs font-body mt-0.5">
            <span className="text-jade-400">{activeCount}</span> active ·{" "}
            <span className="text-sky-400">{completedCount}</span> completed
          </p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setError(""); setAiStatus(""); }}
          className={`text-xs px-3 py-2 rounded-sm transition-colors font-display
            ${showForm ? "bg-ink-700 text-ink-300 border border-ink-600" : "bg-jade-600 hover:bg-jade-500 text-white"}`}>
          {showForm ? "✕ Cancel" : "+ New Goal"}
        </button>
      </div>

      {/* AI status banners */}
      {aiStatus === "generating" && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-jade-600/10 border border-jade-600/20 rounded-sm mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-jade-500 animate-pulse flex-shrink-0" />
          <p className="text-jade-400 text-xs font-body">AI is generating your task plan…</p>
        </div>
      )}
      {aiStatus === "done" && taskPreview !== null && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-jade-600/10 border border-jade-600/20 rounded-sm mb-4">
          <span className="text-jade-400 text-sm">✓</span>
          <p className="text-jade-400 text-xs font-body flex-1">{taskPreview} tasks generated — see Tasks tab</p>
          <button onClick={() => setAiStatus("")} className="text-jade-700 text-xs">×</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-ink-800 border border-jade-600/30 rounded-sm p-3.5 md:p-4 mb-5 space-y-3">
          <p className="text-jade-400 text-[11px] font-display tracking-widest uppercase">New Goal</p>

          {error && (
            <p className="text-rose-400 text-xs font-body bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-sm">{error}</p>
          )}

          <input autoFocus value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Goal title (e.g. Learn DSA in 30 days)" required
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none focus:border-jade-500 font-body" />

          <textarea value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your goal in detail for better AI tasks…&#10;e.g. I need to cover arrays, linked lists, trees and graphs for coding interviews"
            rows={3}
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none focus:border-jade-500 font-body resize-none" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-ink-400 uppercase tracking-widest font-display block mb-1">Target Date</label>
              <input type="date" value={form.targetDate} min={today}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body" />
            </div>
            <div>
              <label className="text-[10px] text-ink-400 uppercase tracking-widest font-display block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {form.targetDate && (
            <div className="flex items-start gap-2 px-3 py-2 bg-jade-600/10 border border-jade-600/20 rounded-sm">
              <span className="text-jade-400 text-xs mt-0.5">◈</span>
              <p className="text-jade-600 text-xs font-body">
                AI will generate specific daily tasks for {differenceInDays(parseISO(form.targetDate), new Date())} days
              </p>
            </div>
          )}

          <button type="submit" disabled={saving || !form.title.trim()}
            className="w-full py-3 bg-jade-600 hover:bg-jade-500 disabled:opacity-50 text-white text-sm rounded-sm font-display transition-colors flex items-center justify-center gap-2">
            {saving ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating AI task plan…
              </>
            ) : (
              <>◈ Create Goal + Generate AI Tasks</>
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
            className={`text-[11px] px-2.5 py-1.5 rounded-sm border transition-all font-display
              ${filterStatus === f.id
                ? "bg-jade-600/20 text-jade-400 border-jade-600/30"
                : "text-ink-500 border-transparent hover:text-ink-300"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-ink-600">
          <div className="text-4xl mb-3">◎</div>
          <p className="text-sm font-display text-ink-500">
            {filterStatus === "all" ? "No goals yet" : `No ${filterStatus} goals`}
          </p>
          {filterStatus === "all" && (
            <p className="text-xs font-body text-ink-700 mt-2 max-w-xs mx-auto leading-relaxed">
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
