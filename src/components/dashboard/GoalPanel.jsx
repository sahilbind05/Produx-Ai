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
  if (days < 0)  return <span className="text-rose-400 text-[10px] font-body">⚠ {Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-amber-400 text-[10px] font-body">Due today</span>;
  return <span className="text-ink-500 text-[10px] font-body">{days}d left</span>;
}

// ── Single goal card ───────────────────────────────────────────────────────
function GoalCard({ goal, tasks, isGenerating, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const progress    = useMemo(() => calcGoalProgress(goal.id, tasks), [goal.id, tasks]);
  const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
  const doneTasks   = linkedTasks.filter((t) => t.completed);
  const overdueTasks = linkedTasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < format(new Date(), "yyyy-MM-dd")
  );
  const statusCls = STATUS[goal.status]?.cls || STATUS.active.cls;

  return (
    <div className={`bg-ink-800 border rounded-sm transition-all
      ${goal.status === "completed" ? "border-ink-800 opacity-70" : "border-ink-700 hover:border-ink-600"}`}>

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-display uppercase tracking-wider ${statusCls}`}>
                {goal.status}
              </span>
              {goal.category && (
                <span className="text-[10px] text-ink-600 font-body capitalize">#{goal.category}</span>
              )}
              {isGenerating && (
                <span className="text-[10px] text-jade-400 font-body flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
                  AI generating tasks…
                </span>
              )}
            </div>
            <h3 className="text-ink-100 text-sm font-display font-semibold leading-snug">{goal.title}</h3>
            {goal.description && (
              <p className="text-ink-500 text-xs mt-1 font-body leading-relaxed line-clamp-2">{goal.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onUpdate(goal.id, { status: goal.status === "completed" ? "active" : "completed" })}
              title={goal.status === "completed" ? "Reactivate" : "Mark complete"}
              className="text-ink-500 hover:text-jade-400 text-xs w-6 h-6 flex items-center justify-center transition-colors rounded-sm hover:bg-jade-600/10"
            >
              {goal.status === "completed" ? "↺" : "✓"}
            </button>
            <button
              onClick={() => onUpdate(goal.id, { status: goal.status === "paused" ? "active" : "paused" })}
              title={goal.status === "paused" ? "Resume" : "Pause"}
              className="text-ink-500 hover:text-amber-400 text-xs w-6 h-6 flex items-center justify-center transition-colors rounded-sm hover:bg-amber-500/10"
            >
              {goal.status === "paused" ? "▶" : "⏸"}
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              title="Delete goal"
              className="text-ink-500 hover:text-rose-400 text-xs w-6 h-6 flex items-center justify-center transition-colors rounded-sm hover:bg-rose-500/10"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-ink-500 font-body">
              {isGenerating
                ? "Generating AI tasks…"
                : `${doneTasks.length}/${linkedTasks.length} tasks done`}
            </span>
            <span className="text-[11px] font-display font-medium text-jade-400">{progress}%</span>
          </div>
          <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
            {isGenerating ? (
              <div className="h-full w-full bg-jade-600/40 animate-pulse rounded-full" />
            ) : (
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: progress >= 75 ? "#22c55e" : progress >= 40 ? "#3D7A57" : "#F59E0B",
                }}
              />
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DaysLeft targetDate={goal.targetDate} />
            {overdueTasks.length > 0 && (
              <span className="text-rose-400 text-[10px] font-body">
                {overdueTasks.length} task{overdueTasks.length > 1 ? "s" : ""} overdue
              </span>
            )}
          </div>
          {linkedTasks.length > 0 && !isGenerating && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] text-ink-500 hover:text-jade-400 font-body transition-colors"
            >
              {expanded ? "▲ Hide tasks" : `▼ ${linkedTasks.length} tasks`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable task list */}
      {expanded && linkedTasks.length > 0 && (
        <div className="border-t border-ink-700 px-4 pb-3 pt-3">
          <p className="text-[10px] text-ink-600 uppercase tracking-widest font-display mb-2">AI-Generated Tasks</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  {t.dueDate && <span className="text-[9px] text-ink-600">{t.dueDate}</span>}
                  {t.aiGenerated && <span className="text-[9px] text-jade-700">◈</span>}
                </div>
              </div>
            ))}
          </div>
          {linkedTasks.length > 0 && (
            <p className="text-[10px] text-ink-700 font-body mt-2">
              Go to Tasks tab to complete or edit these.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Goal Panel ─────────────────────────────────────────────────────────────
export default function GoalPanel({ goals, tasks = [], generating = new Set(), onCreate, onUpdate, onDelete }) {
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [aiStatus,    setAiStatus]    = useState(""); // "generating" | "done" | "error"
  const [taskPreview, setTaskPreview] = useState(null); // number of tasks generated
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", targetDate: "", category: "learning",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = goals.filter((g) =>
    filterStatus === "all" ? true : g.status === filterStatus
  );
  const activeCount    = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.targetDate && form.targetDate < today) {
      setError("Target date cannot be in the past."); return;
    }
    setSaving(true);
    setAiStatus("generating");
    setError("");
    try {
      const result = await onCreate(form);
      setTaskPreview(result?.taskCount || null);
      setAiStatus("done");
      setForm({ title: "", description: "", targetDate: "", category: "learning" });
      setShowForm(false);
    } catch (err) {
      setAiStatus("error");
      setError(err.message || "Failed to create goal.");
    } finally {
      setSaving(false);
    }
  };

  const CATEGORIES = ["learning", "work", "health", "fitness", "personal", "finance", "creative"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-ink-100 font-display font-bold text-lg">Goals</h2>
          <p className="text-ink-500 text-xs font-body mt-0.5">
            <span className="text-jade-400">{activeCount}</span> active ·{" "}
            <span className="text-sky-400">{completedCount}</span> completed
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); setAiStatus(""); setTaskPreview(null); }}
          className={`text-xs px-3 py-1.5 rounded-sm transition-colors font-display
            ${showForm
              ? "bg-ink-700 text-ink-300 border border-ink-600"
              : "bg-jade-600 hover:bg-jade-500 text-white"}`}
        >
          {showForm ? "✕ Cancel" : "+ New Goal"}
        </button>
      </div>

      {/* AI status banner */}
      {aiStatus === "generating" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-jade-600/10 border border-jade-600/20 rounded-sm mb-4">
          <div className="w-2 h-2 rounded-full bg-jade-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-jade-400 text-xs font-display font-medium">Claude is planning your tasks…</p>
            <p className="text-jade-600 text-[11px] font-body">Generating specific, day-by-day tasks for your goal</p>
          </div>
        </div>
      )}
      {aiStatus === "done" && taskPreview !== null && (
        <div className="flex items-center gap-3 px-4 py-3 bg-jade-600/10 border border-jade-600/20 rounded-sm mb-4">
          <span className="text-jade-400 text-sm">✓</span>
          <p className="text-jade-400 text-xs font-body">
            <span className="font-display font-medium">{taskPreview} AI tasks generated</span> — go to Tasks tab to see them.
          </p>
          <button
            onClick={() => setAiStatus("")}
            className="ml-auto text-jade-700 hover:text-jade-500 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-ink-800 border border-jade-600/30 rounded-sm p-4 mb-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-jade-500 text-xs">◈</span>
            <p className="text-jade-400 text-[11px] font-display tracking-widest uppercase">New Goal</p>
          </div>

          {error && (
            <p className="text-rose-400 text-xs font-body bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-sm">
              {error}
            </p>
          )}

          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Goal title (e.g. Learn Python for Data Science)"
            required
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none focus:border-jade-500 font-body"
          />

          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your goal in detail — the more specific you are, the better the AI tasks will be.
e.g. I am a CS sophomore preparing for coding interviews. I need to cover arrays, linked lists, trees, graphs, and dynamic programming using the book 'CLRS'."
            rows={3}
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none focus:border-jade-500 font-body resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-ink-400 uppercase tracking-widest font-display block mb-1.5">
                Target Date
                <span className="normal-case text-jade-600 tracking-normal font-body ml-1">(AI uses this)</span>
              </label>
              <input
                type="date"
                value={form.targetDate}
                min={today}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink-400 uppercase tracking-widest font-display block mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 outline-none focus:border-jade-500 font-body"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI tip */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-jade-600/8 border border-jade-600/20 rounded-sm">
            <span className="text-jade-500 text-xs mt-0.5 flex-shrink-0">◈</span>
            <div>
              <p className="text-jade-400 text-xs font-display font-medium mb-0.5">How AI task generation works</p>
              <p className="text-jade-700 text-[11px] font-body leading-relaxed">
                After you create this goal, Claude will read the title, description, and deadline,
                then generate specific day-by-day tasks (like "Study binary trees — Chapter 6",
                not just "Work on goal"). More detail = better tasks.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="w-full py-2.5 bg-jade-600 hover:bg-jade-500 disabled:opacity-50 text-white text-sm rounded-sm font-display transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Claude is generating your task plan…</span>
              </>
            ) : (
              <>
                <span>◈</span>
                <span>Create Goal + Generate AI Tasks</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 mb-5">
        {[
          { id: "all",       label: `All (${goals.length})` },
          { id: "active",    label: `Active (${activeCount})` },
          { id: "completed", label: `Done (${completedCount})` },
          { id: "paused",    label: "Paused" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`text-[11px] px-2.5 py-1 rounded-sm border transition-all font-display
              ${filterStatus === f.id
                ? "bg-jade-600/20 text-jade-400 border-jade-600/30"
                : "text-ink-500 border-transparent hover:text-ink-300"}`}
          >
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
              Create your first goal. Claude will read your description and generate a specific,
              day-by-day task plan automatically.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              tasks={tasks}
              isGenerating={generating.has(g.id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
