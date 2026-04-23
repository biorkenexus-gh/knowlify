// Single source of truth for awarding values. The Cloud Functions also define
// these server-side in `functions/src/shared/points.ts` — keep them in sync;
// server wins in the event of a mismatch.
export const POINT_VALUES = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS_BASE: 50,
  READING_SESSION: 2, // awarded per 30-sec reading heartbeat (max 3 per lesson)
  DAILY_BONUS_BASE: 5, // awarded for the first daily-bonus claim
  STREAK_7_BONUS: 10,
  STREAK_14_BONUS: 15,
  STREAK_30_BONUS: 25,
} as const;

// Reading-session settings (must match functions/src/shared/points.ts).
export const MAX_READING_SESSIONS_PER_LESSON = 3;
export const READING_HEARTBEAT_INTERVAL_MS = 30_000;

export const POINTS_PER_COIN = 1; // 1 point == 1 coin in v1

export const ROLES = ["student", "teacher", "admin"] as const;

export const SITE = {
  name: "Knowlify",
  tagline: "Learn. Earn. Level up.",
  description:
    "Read books, study lessons, take quizzes, and earn rewards while you grow.",
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/courses", label: "Courses", icon: "BookOpen" },
  { href: "/leaderboard", label: "Leaderboard", icon: "Trophy" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/content", label: "Content", icon: "BookOpen" },
  { href: "/admin/activity", label: "Activity", icon: "Activity" },
  { href: "/admin/rewards", label: "Rewards", icon: "Coins" },
] as const;
