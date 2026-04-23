// Pure level math — no DB schema changes, no Cloud Function calls.
// A user's level is derived from their lifetime `points` on the user doc.

export interface Level {
  name: string;
  minPoints: number;
  /** Tailwind class for the badge's ring/border color. */
  ringClass: string;
  /** Tailwind class for the badge's text color. */
  textClass: string;
  /** Emoji used as a small inline mark next to the tier name. */
  emoji: string;
}

export const LEVELS: readonly Level[] = [
  {
    name: "Bronze",
    minPoints: 0,
    ringClass: "ring-amber-700/40",
    textClass: "text-amber-700 dark:text-amber-500",
    emoji: "🥉",
  },
  {
    name: "Silver",
    minPoints: 100,
    ringClass: "ring-slate-400/50",
    textClass: "text-slate-500 dark:text-slate-300",
    emoji: "🥈",
  },
  {
    name: "Gold",
    minPoints: 500,
    ringClass: "ring-amber-500/50",
    textClass: "text-amber-600 dark:text-amber-400",
    emoji: "🥇",
  },
  {
    name: "Platinum",
    minPoints: 1500,
    ringClass: "ring-cyan-400/60",
    textClass: "text-cyan-600 dark:text-cyan-400",
    emoji: "💠",
  },
  {
    name: "Diamond",
    minPoints: 5000,
    ringClass: "ring-violet-500/60",
    textClass: "text-violet-600 dark:text-violet-400",
    emoji: "💎",
  },
] as const;

export interface LevelInfo {
  current: Level;
  /** null if already at the top tier. */
  next: Level | null;
  /** 0–100: how far through the current tier the user is. */
  progress: number;
  /** Points still needed to reach the next tier. 0 at top tier. */
  pointsToNext: number;
}

export function getLevel(points: number): LevelInfo {
  // Walk backwards so we stop at the first tier the user qualifies for.
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      const current = LEVELS[i];
      const next = LEVELS[i + 1] ?? null;
      if (!next) {
        return { current, next: null, progress: 100, pointsToNext: 0 };
      }
      const span = next.minPoints - current.minPoints;
      const into = points - current.minPoints;
      return {
        current,
        next,
        progress: Math.min(100, Math.max(0, (into / span) * 100)),
        pointsToNext: Math.max(0, next.minPoints - points),
      };
    }
  }
  // Defensive: unreachable since Bronze minPoints = 0.
  return {
    current: LEVELS[0],
    next: LEVELS[1] ?? null,
    progress: 0,
    pointsToNext: LEVELS[1]?.minPoints ?? 0,
  };
}
