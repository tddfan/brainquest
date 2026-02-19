# Firebase Setup Guide

Follow these steps once — it takes about 10 minutes.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `quiz-platform` (or anything you like)
4. Disable Google Analytics (optional) → click **Create project**

---

## Step 2 — Enable Authentication

1. In the left sidebar: **Build → Authentication → Get started**
2. Under **Sign-in method** tab, enable **Email/Password**
3. Click **Save**

---

## Step 3 — Create a Firestore Database

1. In the left sidebar: **Build → Firestore Database → Create database**
2. Choose **"Start in test mode"** (fine for development)
3. Pick the region closest to you → click **Enable**

---

## Step 4 — Add a Web App & Get Config Keys

1. In **Project Overview** (home icon), click the **`</>`** (Web) icon
2. Register app with the nickname `quiz-platform`
3. Firebase shows you a `firebaseConfig` object — copy those values

---

## Step 5 — Fill in Your .env File

Open `quiz-platform/.env` and replace the placeholder values:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> **Security:** `.env` is in `.gitignore` — it will never be pushed to GitHub.

---

## Step 6 — Add Firestore Indexes (for Leaderboard)

The leaderboard sorts users by `totalXP` descending. When you first load it,
Firestore may show a link in the browser console like:

```
FirebaseError: The query requires an index. You can create it here: <URL>
```

Just click that URL while signed into Firebase — it creates the index automatically in ~1 minute.

---

## Step 7 — Run the App

```bash
# From the quiz-platform directory:
source ~/.nvm/nvm.sh && nvm use 20 && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start exploring!

---

## Deploying to Vercel

1. Push your project to GitHub (`.env` is already git-ignored)
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In Vercel's **Environment Variables** settings, add all 6 `VITE_FIREBASE_*` variables
4. Click **Deploy** — every future `git push` auto-deploys

---

## Firestore Data Structure

```
users/{uid}
  username: string
  avatarIndex: number
  totalXP: number
  level: number
  quizzesCompleted: number
  email: string
  createdAt: Timestamp

quizHistory/{autoId}
  uid: string
  username: string
  category: string        // "flags" | "science" | "tech" | "history"
  score: number           // correct answers
  total: number           // total questions
  xpEarned: number
  timestamp: Timestamp
```
