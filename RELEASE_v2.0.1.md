# Release v2.0.1 - Deployment & GitHub Release Guide

## What Changed in v2.0.1

### UI Redesign
- Complete UI overhaul with clean minimal design (Apple/Linear-inspired)
- Light/Dark mode toggle with system preference detection
- New color palette: Indigo accent replacing jade green
- Inter font replacing Syne + DM Sans
- Rounded corners and softer shadows throughout

### New Features
- Auto-dismissing notifications (3.5 seconds with slide animation)
- Tasks grouped by date with smart headers (Today, Tomorrow, etc.)
- Goal filter dropdown to view tasks per goal
- Version display in sidebar (v2.0.1)

---

## Files to Update Before Deployment

### 1. Firebase Configuration (if not already set)
File: `src/firebase/config.js`

Make sure your Firebase config uses environment variables for production:

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 2. Environment Variables
Create `.env.production` (don't commit this):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules
In Firebase Console → Firestore → Rules, ensure you have proper rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Git Commands for Release

### Step 1: Stage and Commit All Changes
```bash
git add .
git commit -m "feat: v2.0.1 - UI redesign with light/dark mode

- Complete UI overhaul with clean minimal design
- Added light/dark mode toggle with localStorage persistence
- New indigo accent color palette, Inter font
- Auto-dismissing notifications (3.5s)
- Tasks grouped by date with smart headers
- Goal filter to view tasks per goal
- Version display in sidebar"
```

### Step 2: Create a Git Tag
```bash
git tag -a v2.0.1 -m "Release v2.0.1 - UI Redesign with Light/Dark Mode"
```

### Step 3: Push to GitHub
```bash
git push origin main
git push origin v2.0.1
```

### Step 4: Create GitHub Release
Go to your repo → Releases → "Create a new release"

- **Tag**: v2.0.1
- **Title**: v2.0.1 - UI Redesign with Light/Dark Mode
- **Description**:

```markdown
## What's New in v2.0.1

### 🎨 Complete UI Redesign
- Clean minimal design inspired by Apple/Linear
- Light and dark mode with system preference detection
- New indigo accent color palette
- Inter font for better readability
- Softer rounded corners and shadows

### ✨ New Features
- **Auto-dismissing notifications** - Alerts now fade out after 3.5 seconds
- **Tasks grouped by date** - Smart headers like "Today", "Tomorrow", "Yesterday"
- **Goal filter** - Filter tasks by specific goals
- **Version display** - App version shown in sidebar

### 🔧 Technical
- Theme context with localStorage persistence
- Tailwind dark mode with class strategy
- Improved component architecture
```

---

## Deploy to Firebase Hosting (if using)

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Deploy
```bash
firebase deploy --only hosting
```

---

## Deploy to Vercel/Netlify (Alternative)

Just push to GitHub - if you have auto-deploy configured, it will build automatically.

For manual deploy:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`

---

## Checklist Before Release

- [x] Version updated in `package.json` (2.0.1)
- [x] Version file created (`src/config/version.js`)
- [x] Version displayed in UI (sidebar)
- [ ] Firebase config uses environment variables
- [ ] `.env.production` created (not committed)
- [ ] Firestore security rules updated
- [ ] Build passes (`npm run build`)
- [ ] Git commit created
- [ ] Git tag v2.0.1 created
- [ ] Pushed to GitHub
- [ ] GitHub Release created
- [ ] Deployed to hosting
