import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markNotificationRead, addNotification } from "../firebase/firestore";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetch = useCallback(async () => {
    if (!user) return;
    const data = await getNotifications(user.uid);
    setNotifications(data);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    await markNotificationRead(user.uid, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const push = async (message, type = "info") => {
    await addNotification(user.uid, { message, type });
    await fetch();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, push, refresh: fetch };
}
