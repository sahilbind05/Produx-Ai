import { useState } from "react";
import { format, subDays } from "date-fns";

const ICONS = ["🏃", "📚", "💧", "🧘", "🥗", "💪", "✍️", "🎯", "🛌", "🌿"];
const COLORS = ["jade", "sky", "amber", "rose"];

function HabitCard({ habit, onCheckIn, onDelete }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const checkedToday = habit.completedDates?.includes(today);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    return { date: d, done: habit.completedDates?.includes(d) };
  });

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-sm p-4 hover:border-ink-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{habit.icon || "🎯"}</span>
          <div>
            <p className="text-ink-100 text-sm font-display font-medium">{habit.name}</p>
            <p className="text-ink-500 text-xs font-body">{habit.frequency || "daily"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-jade-400 text-lg font-bold font-display leading-none">{habit.streak || 0}</p>
            <p className="text-ink-600 text-[10px] font-body">streak</p>
          </div>
          <button onClick={() => onDelete(habit.id)} className="text-ink-600 hover:text-rose-400 text-xs transition-colors ml-1">×</button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1 mb-3">
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-6 rounded-sm transition-colors ${d.done ? "bg-jade-600" : "bg-ink-700"}`} />
            <span className="text-[9px] text-ink-600 font-body">
              {format(subDays(new Date(), 6 - i), "EEE")[0]}
            </span>
          </div>
        ))}
      </div>

      <button onClick={() => onCheckIn(habit.id)} disabled={checkedToday}
        className={`w-full py-2 text-xs rounded-sm transition-all font-display tracking-wide
          ${checkedToday
            ? "bg-jade-600/20 text-jade-400 border border-jade-600/30 cursor-default"
            : "bg-jade-600 hover:bg-jade-500 text-white"}`}>
        {checkedToday ? "✓ Completed today" : "Mark Complete"}
      </button>
    </div>
  );
}

export default function HabitTracker({ habits, onCreate, onCheckIn, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🎯", frequency: "daily" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onCreate(form);
    setForm({ name: "", icon: "🎯", frequency: "daily" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-ink-100 font-display font-bold text-lg">Habit Tracker</h2>
          <p className="text-ink-500 text-xs font-body mt-0.5">Build consistency one day at a time</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="text-xs px-3 py-1.5 bg-jade-600 hover:bg-jade-500 text-white rounded-sm transition-colors font-display">
          + Habit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-ink-800 border border-jade-600/30 rounded-sm p-4 mb-5">
          <p className="text-jade-400 text-xs font-display tracking-wide uppercase mb-3">New Habit</p>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Habit name (e.g. Read 30 minutes)" required
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 mb-3 outline-none focus:border-jade-500 font-body" />
          <div className="mb-3">
            <p className="text-[11px] text-ink-400 font-display uppercase tracking-widest mb-2">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  className={`text-lg p-1 rounded-sm transition-all border
                    ${form.icon === ic ? "border-jade-500 bg-jade-600/20" : "border-transparent hover:border-ink-600"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2 mb-4 outline-none focus:border-jade-500 font-body">
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays only</option>
            <option value="weekends">Weekends only</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-jade-600 hover:bg-jade-500 text-white text-sm rounded-sm font-display transition-colors disabled:opacity-60">
              {saving ? "Creating…" : "Add Habit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 border border-ink-600 text-ink-400 text-sm rounded-sm hover:text-ink-200 font-body transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-12 text-ink-600">
          <div className="text-3xl mb-2">◑</div>
          <p className="text-sm font-display">No habits tracked yet</p>
          <p className="text-xs mt-1 font-body text-ink-700">Add a habit to start building streaks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onCheckIn={onCheckIn} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
