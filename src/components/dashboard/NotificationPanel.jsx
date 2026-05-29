import { format } from "date-fns";

const typeConfig = {
  info:    "border-sky-500/30  bg-sky-500/5   text-sky-400",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  success: "border-jade-600/30  bg-jade-600/5  text-jade-400",
  urgent:  "border-rose-500/30  bg-rose-500/5  text-rose-400",
};

export default function NotificationPanel({ notifications, onMarkRead }) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {unread.slice(0, 3).map((n) => (
        <div key={n.id}
          className={`mb-2 p-3.5 border rounded-sm backdrop-blur-sm font-body text-xs leading-relaxed
            flex items-start gap-2.5 shadow-lg ${typeConfig[n.type] || typeConfig.info}`}>
          <span className="flex-1">{n.message}</span>
          <button onClick={() => onMarkRead(n.id)} className="text-ink-500 hover:text-ink-200 flex-shrink-0 mt-0.5">×</button>
        </div>
      ))}
    </div>
  );
}
