import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { addTask, getTasks, updateTask, deleteTask, logAnalyticsEvent } from "../firebase/firestore";
import { format } from "date-fns";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTasks(user.uid);
      setTasks(data);
    } catch (err) {
      console.error("fetchTasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Add a new task — optimistic insert then sync
  const create = async (taskData) => {
    if (!user) return;
    setError(null);
    try {
      const ref = await addTask(user.uid, {
        ...taskData,
        dueDate: taskData.dueDate || format(new Date(), "yyyy-MM-dd"), // default to today
      });
      // Optimistic: add immediately without waiting for a full refetch
      const optimistic = {
        id: ref.id,
        ...taskData,
        dueDate: taskData.dueDate || format(new Date(), "yyyy-MM-dd"),
        completed: false,
        aiGenerated: false,
      };
      setTasks((prev) => [optimistic, ...prev]);
    } catch (err) {
      console.error("createTask:", err);
      setError(err.message);
      throw err;
    }
  };

  // Toggle complete / incomplete
  const toggle = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    // Optimistic update first — UI feels instant
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await updateTask(user.uid, id, { completed });
      // Log completion event for analytics
      if (completed) {
        await logAnalyticsEvent(user.uid, {
          type: "task_completed",
          taskId: id,
          taskTitle: task.title,
          date: format(new Date(), "yyyy-MM-dd"),
        });
      }
    } catch (err) {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
      console.error("toggleTask:", err);
      setError(err.message);
    }
  };

  // Edit a task's fields (title, priority, dueDate, etc.)
  const edit = async (id, data) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    try {
      await updateTask(user.uid, id, data);
    } catch (err) {
      // Rollback
      await fetchTasks();
      console.error("editTask:", err);
      setError(err.message);
    }
  };

  const remove = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(user.uid, id);
    } catch (err) {
      await fetchTasks(); // Rollback
      console.error("deleteTask:", err);
      setError(err.message);
    }
  };

  return { tasks, loading, error, create, toggle, edit, remove, refresh: fetchTasks };
}
