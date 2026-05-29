import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { addHabit, getHabits, updateHabit, deleteHabit } from "../firebase/firestore";
import { computeStreak } from "../utils/aiPlanner";
import { format } from "date-fns";

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    const data = await getHabits(user.uid);
    const enriched = data.map((h) => ({
      ...h,
      streak: computeStreak(h.completedDates),
    }));
    setHabits(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const create = async (habitData) => {
    await addHabit(user.uid, habitData);
    await fetchHabits();
  };

  const checkIn = async (id) => {
    const habit = habits.find((h) => h.id === id);
    const today = format(new Date(), "yyyy-MM-dd");
    const already = habit.completedDates?.includes(today);
    if (already) return; // already checked in today

    const completedDates = [...(habit.completedDates || []), today];
    const streak = computeStreak(completedDates);
    await updateHabit(user.uid, id, { completedDates, streak });
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completedDates, streak } : h))
    );
  };

  const remove = async (id) => {
    await deleteHabit(user.uid, id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return { habits, loading, create, checkIn, remove, refresh: fetchHabits };
}
