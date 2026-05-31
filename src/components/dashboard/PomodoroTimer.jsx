import { useState, useEffect, useRef } from "react";

const MODES = {
  work:       { label: "Focus",       duration: 25 * 60, color: "accent"  },
  shortBreak: { label: "Short Break", duration:  5 * 60, color: "emerald" },
  longBreak:  { label: "Long Break",  duration: 15 * 60, color: "amber"   },
};

const COLOR = {
  accent:  { ring: "#6366F1", text: "text-accent-500",  bg: "bg-accent-500",  light: "bg-accent-50 dark:bg-accent-500/10",  border: "border-accent-200 dark:border-accent-500/20"  },
  emerald: { ring: "#10B981", text: "text-emerald-500", bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  amber:   { ring: "#F59E0B", text: "text-amber-500",  bg: "bg-amber-500",  light: "bg-amber-50 dark:bg-amber-500/10",  border: "border-amber-200 dark:border-amber-500/20"  },
};

export default function PomodoroTimer() {
  const [mode,       setMode]       = useState("work");
  const [time,       setTime]       = useState(MODES.work.duration);
  const [running,    setRunning]    = useState(false);
  const [sessions,   setSessions]   = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const intervalRef  = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") {
              setSessions((s) => s + 1);
              const next = sessions > 0 && (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak";
              setMode(next);
              setTime(MODES[next].duration);
            } else {
              setMode("work");
              setTime(customWork * 60);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, sessions, customWork]);

  const switchMode = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setTime(m === "work" ? customWork * 60 : MODES[m].duration);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTime(mode === "work" ? customWork * 60 : MODES[mode].duration);
  };

  const mins         = String(Math.floor(time / 60)).padStart(2, "0");
  const secs         = String(time % 60).padStart(2, "0");
  const total        = mode === "work" ? customWork * 60 : MODES[mode].duration;
  const progress     = ((total - time) / total) * 100;
  const c            = COLOR[MODES[mode].color];
  const circumference = 2 * Math.PI * 80;

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-surface-900 dark:text-surface-100 font-bold text-xl mb-1">Focus Timer</h2>
        <p className="text-surface-500 text-sm">Pomodoro technique for deep work sessions</p>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Mode tabs */}
        <div className="flex gap-1 mb-8 bg-surface-100 dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl p-1">
          {Object.entries(MODES).map(([key, cfg]) => (
            <button key={key} onClick={() => switchMode(key)}
              className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-medium
                ${mode === key ? `${c.bg} text-white shadow-sm` : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"}`}>
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48 md:w-52 md:h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="8" />
              <circle cx="90" cy="90" r="80" fill="none"
                stroke={c.ring} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl md:text-6xl font-bold ${c.text}`}>
                {mins}:{secs}
              </span>
              <span className="text-surface-400 text-sm mt-1">{MODES[mode].label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setRunning((v) => !v)}
            className={`flex-1 py-4 ${c.bg} hover:opacity-90 active:scale-[0.98] text-white rounded-xl font-medium text-sm transition-all shadow-sm`}>
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={reset}
            className="px-6 border border-surface-200 dark:border-slate-700 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-xl font-medium text-sm transition-colors hover:bg-surface-50 dark:hover:bg-slate-800">
            ↺
          </button>
        </div>

        {/* Custom duration */}
        <div className="bg-white dark:bg-slate-800/50 border border-surface-200 dark:border-slate-700 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-surface-600 dark:text-surface-400 font-medium">Focus Duration</label>
            <span className={`text-sm font-bold ${c.text}`}>{customWork} min</span>
          </div>
          <input type="range" min="5" max="60" step="5" value={customWork}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setCustomWork(v);
              if (mode === "work" && !running) setTime(v * 60);
            }}
            className="w-full accent-accent-500 h-2" />
          <div className="flex justify-between text-xs text-surface-400 mt-1.5">
            <span>5 min</span><span>60 min</span>
          </div>
        </div>

        {/* Sessions counter */}
        <div className={`${c.light} border ${c.border} rounded-xl p-5 text-center`}>
          <p className={`${c.text} text-3xl font-bold`}>{sessions}</p>
          <p className="text-surface-500 text-sm mt-1">focus sessions completed</p>
          {sessions > 0 && (
            <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
              {Array.from({ length: Math.min(sessions, 8) }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c.bg}`} />
              ))}
              {sessions > 8 && <span className="text-xs text-surface-400">+{sessions - 8}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
