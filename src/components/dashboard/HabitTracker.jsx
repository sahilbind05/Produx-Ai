import { useState } from "react";
import { format, subDays } from "date-fns";
import { computeStreak } from "../../utils/aiPlanner";

const ICONS = ["🏃","📚","💧","🧘","🥗","💪","✍️","🎯","🛌","🌿","🎸","🧠"];

function HabitCard({ habit, onCheckIn, onDelete }) {
  const today        = format(new Date(), "yyyy-MM-dd");
  const checkedToday = habit.completedDates?.includes(today);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    return { date: d, done: habit.completedDates?.includes(d), label: format(subDays(new Date(), 6 - i), "EEE")[0] };
  });

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-sm p-3.5 flex flex-col">
      {/* Title row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.icon || "🎯"}</span>
          <div>
            <p className="text-ink-100 text-sm font-display font-medium leading-tight">{habit.name}</p>
            <p className="text-ink-500 text-[10px] font-body capitalize">{habit.frequency || "daily"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-jade-400 text-xl font-bold font-display leading-none">{habit.streak || 0}</p>
            <p className="text-ink-600 text-[9px] font-body">streak</p>
          </div>
          <button onClick={() => onDelete(habit.id)}
            className="w-7 h-7 flex items-center justify-center text-ink-600 hover:text-rose-400 text-sm transition-colors">×</button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1 mb-3">
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-5 rounded-sm transition-colors ${d.done ? "bg-jade-600" : "bg-ink-700"}`} />
            <span className="text-[9px] text-ink-600 font-body">{d.label}</span>
          </div>
        ))}
      </div>

      {/* Check-in button — full width, easy to tap */}
      <button onClick={() => onCheckIn(habit.id)} disabled={checkedToday}
        className={`w-full py-2.5 text-xs rounded-sm transition-all font-display tracking-wide mt-auto
          ${checkedToday
            ? "bg-jade-600/20 text-jade-400 border border-jade-600/30"
            : "bg-jade-600 hover:bg-jade-500 text-white active:scale-95"}`}>
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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-ink-100 font-display font-bold text-lg">Habit Tracker</h2>
          <p className="text-ink-500 text-xs font-body mt-0.5">
            <span className="text-jade-400">{checkedToday}</span>/{habits.length} done today ·{" "}
            <span className="text-amber-400">{totalStreak}</span> total streak days
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className={`text-xs px-3 py-2 rounded-sm transition-colors font-display
            ${showForm ? "bg-ink-700 text-ink-300 border border-ink-600" : "bg-jade-600 hover:bg-jade-500 text-white"}`}>
          {showForm ? "✕" : "+ Habit"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-ink-800 border border-jade-600/30 rounded-sm p-3.5 mb-5 space-y-3">
          <p className="text-jade-400 text-[11px] font-display tracking-widest uppercase">New Habit</p>

          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Read for 30 minutes" required autoFocus
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none focus:border-jade-500 font-body" />

          <div>
            <p className="text-[10px] text-ink-400 font-display uppercase tracking-widest mb-2">Pick an icon</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  className={`text-xl p-1.5 rounded-sm border transition-all
                    ${form.icon === ic ? "border-jade-500 bg-jade-600/20" : "border-transparent hover:border-ink-600"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 text-ink-100 text-sm rounded-sm px-3 py-2.5 outline-none font-body">
            <option value="daily">Every day</option>
            <option value="weekdays">Weekdays only</option>
            <option value="weekends">Weekends only</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.name.trim()}
              className="flex-1 py-3 bg-jade-600 hover:bg-jade-500 disabled:opacity-50 text-white text-sm rounded-sm font-display">
              {saving ? "Adding…" : "Add Habit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 border border-ink-600 text-ink-400 text-sm rounded-sm font-body">Cancel</button>
          </div>
        </form>
      )}

      {/* Habit grid — 1 col on small mobile, 2 cols on larger */}
      {habits.length === 0 ? (
        <div className="text-center py-14 text-ink-600">
          <div className="text-4xl mb-3">◑</div>
          <p className="text-sm font-display text-ink-500">No habits tracked yet</p>
          <p className="text-xs font-body text-ink-700 mt-1">Add a habit to start building daily streaks</p>
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
