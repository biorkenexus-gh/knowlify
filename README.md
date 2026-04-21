# Knowlify

> Learn. Earn. Level up.

A learning + earning platform: read books/articles, watch lessons, take timed quizzes, and earn simulated points & coins that feed a live leaderboard. Built with Next.js 15 (App Router) on an all-Firebase backend (Auth + Firestore + Storage + Cloud Functions).

---

## Architecture at a glance

```
Next.js 15 (Vercel) ─┬─ direct reads + safe writes ──▶ Firestore (rules-gated)
                     ├─ auth                         ──▶ Firebase Auth
                     └─ privileged writes (callable) ──▶ Cloud Functions ──▶ Firestore (admin SDK)
```

- **Client-safe writes** (bookmarks, progress heartbeats): straight to Firestore, guarded by security rules.
- **Privileged writes** (points, coins, quiz grading, admin ops): always go through a Cloud Function. Clients can never mutate `transactions`, `users.points`, `users.coins`, or `attempts.score`.
- **Role-based access** via Firebase custom claims: `student` (default) / `teacher` / `admin`.
- **Leaderboard** is a single doc pre-baked every 5 minutes by a scheduled function — one read serves the page.

Full plan lives in `../../.claude/plans/you-are-a-senior-expressive-sprout.md`.

---

## Project structure

```
app/                           # Next.js App Router
  (marketing)/                 # public landing
  (auth)/                      # login, signup
  (dashboard)/                 # authed: dashboard, courses, quizzes, leaderboard, profile
  admin/                       # admin-only: users, content, activity, rewards
components/
  ui/                          # shadcn-style primitives (button, card, table, …)
  auth/ courses/ content/ quizzes/ dashboard/ admin/ layout/ providers/
lib/
  firebase/                    # client.ts, admin.ts, auth.ts, firestore.ts, storage.ts, functions.ts
  hooks/                       # use-auth, use-course, use-progress, use-leaderboard
  utils/                       # cn, format, search-terms
  constants.ts                 # POINT_VALUES, nav items, role list
types/                         # shared TypeScript types
functions/                     # Cloud Functions (deployed separately)
  src/
    auth/onUserCreate.ts
    quizzes/submitQuizAttempt.ts, getQuizQuestions.ts
    lessons/awardLessonPoints.ts
    admin/setUserRole.ts, adminGrantPoints.ts, adminDeleteUser.ts, adminDeleteContent.ts
    leaderboard/recomputeLeaders.ts
    shared/points.ts, guards.ts
scripts/seed.ts                # local seed against the emulator
firestore.rules                # enumerated per-collection access
storage.rules                  # file-size + MIME caps
firestore.indexes.json
firebase.json, .firebaserc
```

---

## Prerequisites

- Node.js **20+**
- `pnpm` (recommended) or `npm`
- Firebase CLI: `npm i -g firebase-tools`
- A Firebase project (you can run fully local on emulators until you're ready to deploy)

---

## Quick start (local, emulators only)

```bash
# 1. install dependencies (both the Next.js app and the Cloud Functions)
pnpm install
cd functions && npm install && cd ..

# 2. copy env template — for pure emulator dev, the NEXT_PUBLIC_* values can be
#    left as placeholders; only NEXT_PUBLIC_USE_EMULATORS=true matters.
cp .env.example .env.local

# 3. build the functions (needed the first time and after any change)
cd functions && npm run build && cd ..

# 4. start the Firebase emulators (auth, firestore, storage, functions)
pnpm emulators
# Emulator UI at http://localhost:4000

# 5. in a second terminal, seed sample data
pnpm seed

# 6. start the Next.js app
pnpm dev
# App at http://localhost:3000
```

**Seeded accounts (all password `password123`):**

| Email | Role |
|---|---|
| `admin@knowlify.test` | admin |
| `teacher@knowlify.test` | teacher |
| `student@knowlify.test` | student |

---

## Connecting to a real Firebase project

1. Create a project at <https://console.firebase.google.com/>.
2. Enable: **Authentication → Email/Password**, **Firestore** (production mode), **Storage**, **Functions** (**Blaze plan required**).
3. `firebase login` then `firebase use --add <your-project-id>`.
4. Grab the web-SDK config from Project settings → General → Your apps, and fill in `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
5. For the Admin SDK (seed script / server actions), create a service account key: Project settings → Service accounts → Generate new private key. Fill in `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY`.
6. Set `NEXT_PUBLIC_USE_EMULATORS=false`.

### Deploy

```bash
# rules + indexes + storage
pnpm deploy:rules

# cloud functions (needs Blaze plan)
pnpm deploy:functions

# frontend to Vercel
vercel --prod
```

---

## How the earning system works

1. Student finishes a lesson → client writes to `progress/{uid}_{courseId}`, adding the lesson id to `completedLessonIds`.
2. Firestore trigger `awardLessonPoints` fires, checks the ledger for an existing award (idempotent), and awards that lesson's `pointsReward` via a transactional update to `users/{uid}` + `transactions/{auto}`.
3. Student takes a quiz → client calls `submitQuizAttempt` (callable). The function:
   - Reads the `questions` subcollection (which clients can't read directly).
   - Scores server-side.
   - Rate-limits to 3 attempts / 24h and rejects implausibly fast submissions.
   - Writes an `attempts` doc with `score`/`passed`/`pointsAwarded` in a single transaction with the user's points increment and the ledger entry.
4. Every 5 minutes, `recomputeLeaderboard` writes `leaderboard/all_time` with the top 100 users by `points`. The `/leaderboard` page reads this one doc.

No client code can write `points`, `coins`, `attempts.score`, or `transactions` — ever. Enforced in `firestore.rules`.

---

## Scripts

```
pnpm dev                 # start Next.js
pnpm build               # production build
pnpm typecheck           # strict TypeScript check
pnpm lint                # eslint

pnpm emulators           # start Firebase emulators with persistence
pnpm seed                # seed the emulator with sample data
pnpm functions:build     # tsc for Cloud Functions
pnpm functions:serve     # serve functions via firebase shell

pnpm deploy              # firebase deploy everything
pnpm deploy:rules        # rules + indexes + storage only
pnpm deploy:functions    # functions only
```

---

## What's in v1 vs. out

**In:** auth + roles, content CRUD, lesson viewer (PDF/video/markdown), progress tracking, bookmarks, timed quizzes with server-side grading, points/coins, leaderboard, dashboard widgets, admin panel (users / content / activity / rewards), dark mode.

**Out (future):** forum, AI-powered recommendations (we use a category heuristic), real-time notifications, streaks/badges, real money payouts, Algolia-backed search.

---

## Extending

- **Point values:** edit `functions/src/shared/points.ts` (canonical) and `lib/constants.ts` (UI display only).
- **New Cloud Function:** add the file under `functions/src/<area>/`, export from `functions/src/index.ts`.
- **New collection:** add a typed converter in `lib/firebase/firestore.ts`, type in `types/`, and access rules in `firestore.rules`.
- **New admin page:** add it under `app/admin/`, register in `ADMIN_NAV_ITEMS` (`lib/constants.ts`).

---

## Troubleshooting

- **`Missing FIREBASE_ADMIN_* env vars` when running `pnpm seed`**: the seed script auto-detects the emulator via `FIRESTORE_EMULATOR_HOST`. Make sure the emulators are running before you run seed; the script sets those env vars for you via `cross-env`.
- **`permission-denied` on Firestore reads**: the `role` custom claim may not have propagated yet. Log out and back in, or call `auth.currentUser.getIdToken(true)` (our `setUserRole` callable does this for admins).
- **PDF fails to load**: `react-pdf` pulls `pdf.worker.js` from unpkg at runtime. Check browser devtools network tab — if it's blocked, allowlist `unpkg.com` or self-host the worker.
- **Functions deploy fails with `requires the Blaze plan`**: upgrade your Firebase project to pay-as-you-go billing. Free-tier quotas still apply; you won't be charged until you exceed them.
