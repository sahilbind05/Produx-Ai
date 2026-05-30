import { useState, useEffect, useRef } from "react";

const MODES = {
  work:       { label: "Focus",       duration: 25 * 60, color: "jade"  },
  shortBreak: { label: "Short Break", duration:  5 * 60, color: "sky"   },
  longBreak:  { label: "Long Break",  duration: 15 * 60, color: "amber" },
};

const COLOR = {
  jade:  { ring: "#3D7A57", text: "text-jade-400",  bg: "bg-jade-600",  light: "bg-jade-600/10",  border: "border-jade-600/20"  },
  sky:   { ring: "#0EA5E9", text: "text-sky-400",   bg: "bg-sky-500",   light: "bg-sky-500/10",   border: "border-sky-500/20"   },
  amber: { ring: "#F59E0B", text: "text-amber-400", bg: "bg-amber-500", light: "bg-amber-500/10", border: "border-amber-500/20" },
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
      <div className="mb-5 text-center">
        <h2 className="text-ink-100 font-display font-bold text-lg mb-0.5">Focus Timer</h2>
        <p className="text-ink-500 text-xs font-body">Pomodoro technique for deep work sessions</p>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Mode tabs */}
        <div className="flex gap-1.5 mb-8 bg-ink-800 border border-ink-700 rounded-sm p-1">
          {Object.entries(MODES).map(([key, cfg]) => (
            <button key={key} onClick={() => switchMode(key)}
              className={`flex-1 py-2 text-xs rounded-sm transition-all font-display
                ${mode === key ? `${c.bg} text-white` : "text-ink-400 hover:text-ink-200"}`}>
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Circle timer */}
        <div className="flex justify-center mb-8">
          <div className="relative w-44 h-44 md:w-48 md:h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" fill="none" stroke="#1A1A1A" strokeWidth="8" />
              <circle cx="90" cy="90" r="80" fill="none"
                stroke={c.ring} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display text-4xl md:text-5xl font-bold ${c.text}`}>
                {mins}:{secs}
              </span>
              <span className="text-ink-500 text-xs mt-1 font-body">{MODES[mode].label}</span>
            </div>
          </div>
        </div>

        {/* Controls — large tap targets */}
        <div className="flex gap-3 mb-5">
          <button onClick={() => setRunning((v) => !v)}
            className={`flex-1 py-4 ${c.bg} hover:opacity-90 active:scale-95 text-white rounded-sm font-display text-sm transition-all`}>
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={reset}
            className="px-6 border border-ink-600 text-ink-400 hover:text-ink-200 rounded-sm font-display text-sm transition-colors">
            ↺
          </button>
        </div>

        {/* Custom duration slider */}
        <div className="bg-ink-800 border border-ink-700 rounded-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-ink-400 uppercase tracking-widest font-display">Focus Duration</label>
            <span className={`text-sm font-bold font-display ${c.text}`}>{customWork} min</span>
          </div>
          <input type="range" min="5" max="60" step="5" value={customWork}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setCustomWork(v);
              if (mode === "work" && !running) setTime(v * 60);
            }}
            className="w-full accent-jade-500 h-2" />
          <div className="flex justify-between text-[10px] text-ink-600 mt-1 font-body">
            <span>5 min</span><span>60 min</span>
          </div>
        </div>

        {/* Sessions counter */}
        <div className={`${c.light} border ${c.border} rounded-sm p-4 text-center`}>
          <p className={`${c.text} font-display text-3xl font-bold`}>{sessions}</p>
          <p className="text-ink-500 text-xs mt-0.5 font-body">focus sessions completed</p>
          {sessions > 0 && (
            <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
              {Array.from({ length: Math.min(sessions, 8) }, (_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
              ))}
              {sessions > 8 && <span className="text-[10px] text-ink-500 font-body">+{sessions - 8}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
