// Single source of truth for awarding values. The Cloud Functions also define
// these server-side in `functions/src/shared/points.ts` — keep them in sync;
// server wins in the event of a mismatch.
export const POINT_VALUES = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS_BASE: 50,
  READING_SESSION: 2, // awarded per (future) reading heartbeat
} as const;

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
