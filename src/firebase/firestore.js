import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, setDoc,
} from "firebase/firestore";
import { db } from "./config";

// ── shortcuts ──────────────────────────────────────────────────────────────
const userCol = (uid, name) => collection(db, "users", uid, name);

// ── USERS ──────────────────────────────────────────────────────────────────
export const createUserProfile = (uid, data) =>
  setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    preferences: {
      workHoursPerDay: 8,
      preferredTime: "morning",
      weeklyGoalCount: 5,
      pomodoroLength: 25,
      notifications: true,
    },
  });

export const getUserProfile  = (uid)       => getDoc(doc(db, "users", uid));
export const updateUserProfile = (uid, d)  =>
  updateDoc(doc(db, "users", uid), { ...d, updatedAt: serverTimestamp() });

// ── GOALS ──────────────────────────────────────────────────────────────────
export const addGoal = (uid, goal) =>
  addDoc(userCol(uid, "goals"), {
    ...goal,
    progress: 0,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const getGoals = async (uid) => {
  const snap = await getDocs(query(userCol(uid, "goals"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateGoal = (uid, goalId, data) =>
  updateDoc(doc(db, "users", uid, "goals", goalId), {
    ...data, updatedAt: serverTimestamp(),
  });

export const deleteGoal = (uid, goalId) =>
  deleteDoc(doc(db, "users", uid, "goals", goalId));

// ── TASKS ──────────────────────────────────────────────────────────────────
// Returns the DocumentReference so callers can read .id
export const addTask = (uid, task) =>
  addDoc(userCol(uid, "tasks"), {
    title:       task.title       ?? "",
    goalId:      task.goalId      ?? null,
    priority:    task.priority    ?? "medium",
    completed:   task.completed   ?? false,
    dueDate:     task.dueDate     ?? null,
    aiGenerated: task.aiGenerated ?? false,
    createdAt:   serverTimestamp(),
  });

export const getTasks = async (uid) => {
  const snap = await getDocs(query(userCol(uid, "tasks"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateTask = (uid, taskId, data) =>
  updateDoc(doc(db, "users", uid, "tasks", taskId), data);

export const deleteTask = (uid, taskId) =>
  deleteDoc(doc(db, "users", uid, "tasks", taskId));

// ── HABITS ─────────────────────────────────────────────────────────────────
export const addHabit = (uid, habit) =>
  addDoc(userCol(uid, "habits"), {
    name:           habit.name           ?? "",
    icon:           habit.icon           ?? "🎯",
    frequency:      habit.frequency      ?? "daily",
    streak:         0,
    completedDates: [],
    createdAt:      serverTimestamp(),
  });

export const getHabits = async (uid) => {
  const snap = await getDocs(userCol(uid, "habits"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateHabit = (uid, habitId, data) =>
  updateDoc(doc(db, "users", uid, "habits", habitId), data);

export const deleteHabit = (uid, habitId) =>
  deleteDoc(doc(db, "users", uid, "habits", habitId));

// ── ANALYTICS ─────────────────────────────────────────────────────────────
export const logAnalyticsEvent = (uid, event) =>
  addDoc(userCol(uid, "analytics"), {
    ...event,
    timestamp: serverTimestamp(),
  });

export const getAnalytics = async (uid) => {
  const snap = await getDocs(query(userCol(uid, "analytics"), orderBy("timestamp", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────
export const addNotification = (uid, notif) =>
  addDoc(userCol(uid, "notifications"), {
    message: notif.message ?? "",
    type:    notif.type    ?? "info",
    read:    false,
    createdAt: serverTimestamp(),
  });

export const getNotifications = async (uid) => {
  const snap = await getDocs(
    query(userCol(uid, "notifications"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const markNotificationRead = (uid, notifId) =>
  updateDoc(doc(db, "users", uid, "notifications", notifId), { read: true });
