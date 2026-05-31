import { useEffect, useState } from "react";

const typeConfig = {
  info:    "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-300",
  warning: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-300",
  success: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  urgent:  "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-700 dark:text-red-300",
};

function NotificationToast({ notification, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={`mb-2 p-3.5 border rounded-xl backdrop-blur-sm text-sm leading-relaxed
        flex items-start gap-2.5 shadow-lg transition-all duration-300
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
        ${typeConfig[notification.type] || typeConfig.info}`}
      style={{ animation: "slideIn 0.3s ease" }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <span className="flex-1">{notification.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(notification.id), 300);
        }}
        className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 flex-shrink-0 mt-0.5 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function NotificationPanel({ notifications, onMarkRead }) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {unread.slice(0, 3).map((n) => (
        <NotificationToast key={n.id} notification={n} onDismiss={onMarkRead} />
      ))}
    </div>
  );
}
