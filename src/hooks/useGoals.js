import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { addGoal, getGoals, updateGoal, deleteGoal, addTask } from "../firebase/firestore";
import { generateAITasks } from "../utils/aiTaskGenerator";

export function useGoals() {
  const { user } = useAuth();
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  // Track which goal IDs are currently generating tasks
  const [generating, setGenerating] = useState(new Set());

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getGoals(user.uid);
      setGoals(data);
    } catch (err) {
      console.error("fetchGoals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // Create goal → call Claude API → save AI tasks to Firestore
  const create = async (goalData) => {
    if (!user) return;
    setError(null);

    try {
      // 1. Save the goal first so we have a real goalId
      const ref    = await addGoal(user.uid, goalData);
      const goalId = ref.id;

      // 2. Optimistically add to local state
      const newGoal = { id: goalId, ...goalData, progress: 0, status: "active" };
      setGoals((prev) => [newGoal, ...prev]);

      // 3. Mark this goal as "AI generating"
      setGenerating((prev) => new Set(prev).add(goalId));

      // 4. Call Claude API to generate specific tasks
      const aiTasks = await generateAITasks({ ...goalData, id: goalId });

      // 5. Save all tasks in parallel to Firestore
      await Promise.all(aiTasks.map((t) => addTask(user.uid, t)));

      // 6. Done generating
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });

      // 7. Refresh goals to get server timestamps
      await fetchGoals();

      return { goalId, taskCount: aiTasks.length };
    } catch (err) {
      console.error("createGoal:", err);
      setError(err.message);
      throw err;
    }
  };

  const update = async (id, data) => {
    try {
      await updateGoal(user.uid, id, data);
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    } catch (err) {
      console.error("updateGoal:", err);
      setError(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await deleteGoal(user.uid, id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("deleteGoal:", err);
      setError(err.message);
    }
  };

  return { goals, loading, error, generating, create, update, remove, refresh: fetchGoals };
}
