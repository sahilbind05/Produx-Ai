# Firebase Setup Guide — Produx AI

## Step 1 — Create a Firebase Project

1. Go to **console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `produx-ai`
4. Disable Google Analytics (optional for dev)
5. Click **"Create project"**

---

## Step 2 — Enable Authentication

1. In your project, click **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method** tab:
   - Enable **Email/Password** → click Save
   - Enable **Google** → pick a support email → click Save

---

## Step 3 — Create Firestore Database

1. Click **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Pick any region close to you (e.g. `asia-south1` for India)
5. Click **Done**

---

## Step 4 — Register a Web App

1. Click the gear icon → **Project Settings**
2. Scroll to **"Your apps"** section
3. Click the **</>** (web) icon
4. Give it a nickname: `produx-ai-web`
5. Click **"Register app"**
6. Copy the **firebaseConfig** object shown

---

## Step 5 — Paste Config into the Project

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "produx-ai.firebaseapp.com",
  projectId:         "produx-ai",
  storageBucket:     "produx-ai.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

---

## Step 6 — Set Firestore Security Rules (for production)

In Firestore → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **Publish**.

---

## Firestore Schema

```
users/                              ← top-level collection
  {uid}/                            ← document per user
    fullName: string
    email: string
    userType: "student" | "professional"
    createdAt: timestamp
    preferences: {
      workHoursPerDay: number
      preferredTime: string
      weeklyGoalCount: number
      pomodoroLength: number
      notifications: boolean
    }

    goals/                          ← subcollection
      {goalId}/
        title: string
        description: string
        targetDate: string (yyyy-MM-dd)
        category: string
        status: "active" | "completed" | "paused"
        progress: number (0-100)
        createdAt: timestamp
        updatedAt: timestamp

    tasks/                          ← subcollection
      {taskId}/
        title: string
        goalId: string | null
        priority: "low" | "medium" | "high"
        completed: boolean
        dueDate: string
        aiGenerated: boolean
        createdAt: timestamp

    habits/                         ← subcollection
      {habitId}/
        name: string
        icon: string (emoji)
        frequency: "daily" | "weekdays" | "weekends"
        streak: number
        completedDates: string[] (yyyy-MM-dd)
        createdAt: timestamp

    analytics/                      ← subcollection
      {eventId}/
        type: string
        taskId: string | null
        date: string
        timestamp: timestamp

    notifications/                  ← subcollection
      {notifId}/
        message: string
        type: "info" | "warning" | "success" | "urgent"
        read: boolean
        createdAt: timestamp
```
