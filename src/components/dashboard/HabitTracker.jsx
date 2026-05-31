import { useState } from "react";
import { format, subDays } from "date-fns";

const ICONS = ["🏃","📚","💧","🧘","🥗","💪","✍️","🎯","🛌","🌿","🎸","🧠"];

function HabitCard({ habit, onCheckIn, onDelete }) {
  const today        = format(new Date(), "yyyy-MM-dd");
  const checkedToday = habit.completedDates?.includes(today);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    return { date: d, done: habit.completedDates?.includes(d), label: format(subDays(new Date(), 6 - i), "EEE")[0] };
  });

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-4 flex flex-col transition-colors hover:border-surface-300 dark:hover:border-slate-600">
      {/* Title row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{habit.icon || "🎯"}</span>
          <div>
            <p className="text-surface-900 dark:text-surface-100 text-sm font-semibold leading-tight">{habit.name}</p>
            <p className="text-surface-400 text-xs capitalize">{habit.frequency || "daily"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-accent-500 text-xl font-bold leading-none">{habit.streak || 0}</p>
            <p className="text-surface-400 text-[10px]">streak</p>
          </div>
          <button onClick={() => onDelete(habit.id)}
            className="w-7 h-7 flex items-center justify-center text-surface-300 hover:text-red-500 text-sm transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">×</button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1.5 mb-4">
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-6 rounded-lg transition-colors ${d.done ? "bg-accent-500" : "bg-surface-100 dark:bg-slate-700"}`} />
            <span className="text-[9px] text-surface-400">{d.label}</span>
          </div>
        ))}
      </div>

      {/* Check-in button */}
      <button onClick={() => onCheckIn(habit.id)} disabled={checkedToday}
        className={`w-full py-2.5 text-sm rounded-lg transition-all font-medium mt-auto
          ${checkedToday
            ? "bg-accent-50 dark:bg-accent-500/10 text-accent-500 border border-accent-200 dark:border-accent-500/30"
            : "bg-accent-500 hover:bg-accent-600 text-white shadow-sm active:scale-[0.98]"}`}>
        {checkedToday ? "✓ Done today" : "Check In"}
      </button>
    </div>
  );
}

export default function HabitTracker({ habits, onCreate, onCheckIn, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🎯", frequency: "daily" });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onCreate(form); setForm({ name: "", icon: "🎯", frequency: "daily" }); setShowForm(false); }
    finally { setSaving(false); }
  };

  const totalStreak  = habits.reduce((a, h) => a + (h.streak || 0), 0);
  const checkedToday = habits.filter((h) => h.completedDates?.includes(format(new Date(), "yyyy-MM-dd"))).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-surface-900 dark:text-surface-100 font-bold text-xl">Habit Tracker</h2>
          <p className="text-surface-500 text-sm mt-1">
            <span className="text-accent-500 font-medium">{checkedToday}</span>/{habits.length} done today ·{" "}
            <span className="text-amber-500 font-medium">{totalStreak}</span> total streak days
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className={`text-sm px-4 py-2 rounded-lg transition-all font-medium
            ${showForm ? "bg-surface-100 dark:bg-slate-700 text-surface-600 dark:text-surface-300" : "bg-accent-500 hover:bg-accent-600 text-white shadow-sm"}`}>
          {showForm ? "✕" : "+ Habit"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800/50 border border-accent-200 dark:border-accent-500/20 rounded-xl p-4 mb-5 space-y-4">
          <p className="text-accent-500 text-xs font-medium tracking-wide uppercase">New Habit</p>

          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Read for 30 minutes" required autoFocus
            className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />

          <div>
            <p className="text-xs text-surface-500 font-medium mb-2">Pick an icon</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  className={`text-xl p-2 rounded-lg border transition-all
                    ${form.icon === ic ? "border-accent-500 bg-accent-50 dark:bg-accent-500/10" : "border-surface-200 dark:border-slate-700 hover:border-surface-300 dark:hover:border-slate-600"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
            className="w-full bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 text-surface-900 dark:text-surface-100 text-sm rounded-lg px-4 py-3 outline-none">
            <option value="daily">Every day</option>
            <option value="weekdays">Weekdays only</option>
            <option value="weekends">Weekends only</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.name.trim()}
              className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors shadow-sm">
              {saving ? "Adding…" : "Add Habit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 border border-surface-200 dark:border-slate-600 text-surface-500 text-sm rounded-lg transition-colors hover:bg-surface-50 dark:hover:bg-slate-700">Cancel</button>
          </div>
        </form>
      )}

      {/* Habit grid */}
      {habits.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <div className="text-4xl mb-3 opacity-40">↻</div>
          <p className="text-sm font-medium text-surface-500">No habits tracked yet</p>
          <p className="text-xs text-surface-400 mt-1">Add a habit to start building daily streaks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onCheckIn={onCheckIn} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
