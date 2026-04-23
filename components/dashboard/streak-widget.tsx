"use client";

import { useMemo, useState } from "react";
import { Flame, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { POINT_VALUES } from "@/lib/constants";
import { callClaimDailyBonus } from "@/lib/firebase/functions";
import type { UserDoc } from "@/types";

interface StreakWidgetProps {
  profile: UserDoc;
  className?: string;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function tierBonus(streak: number): number {
  if (streak >= 30) return POINT_VALUES.STREAK_30_BONUS;
  if (streak >= 14) return POINT_VALUES.STREAK_14_BONUS;
  if (streak >= 7) return POINT_VALUES.STREAK_7_BONUS;
  return 0;
}

/** Label for the NEXT streak milestone, if any. */
function nextMilestone(streak: number): { days: number; extra: number } | null {
  if (streak < 7) return { days: 7, extra: POINT_VALUES.STREAK_7_BONUS };
  if (streak < 14) return { days: 14, extra: POINT_VALUES.STREAK_14_BONUS };
  if (streak < 30) return { days: 30, extra: POINT_VALUES.STREAK_30_BONUS };
  return null;
}

export function StreakWidget({ profile, className }: StreakWidgetProps) {
  const [claiming, setClaiming] = useState(false);

  // The AFTER-CLAIM streak value. If the user last claimed yesterday this is
  // current+1; otherwise streak resets to 1.
  const claimedToday = profile.lastBonusClaimedDate === todayUTC();
  const projectedStreak = claimedToday
    ? profile.currentStreak
    : isContinuingStreak(profile.lastBonusClaimedDate)
    ? (profile.currentStreak ?? 0) + 1
    : 1;

  const projectedReward = useMemo(
    () => POINT_VALUES.DAILY_BONUS_BASE + tierBonus(projectedStreak),
    [projectedStreak]
  );

  const milestone = nextMilestone(profile.currentStreak ?? 0);

  async function handleClaim() {
    setClaiming(true);
    try {
      const res = await callClaimDailyBonus({});
      if (res.data.alreadyClaimed) {
        toast.info("You already claimed today — come back tomorrow!");
      } else {
        toast.success(
          `+${res.data.amount} pts · ${res.data.newStreak}-day streak 🔥`
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily streak
          </CardTitle>
          <Flame
            className={cn(
              "h-5 w-5",
              (profile.currentStreak ?? 0) > 0
                ? "text-orange-500"
                : "text-muted-foreground"
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {profile.currentStreak ?? 0}
          </span>
          <span className="text-sm text-muted-foreground">
            day{profile.currentStreak === 1 ? "" : "s"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Best: {profile.longestStreak ?? 0} · Claimed:{" "}
          {profile.totalBonusesClaimed ?? 0}×
        </p>

        {claimedToday ? (
          <div className="rounded-md border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
            ✓ Claimed today. Come back tomorrow.
          </div>
        ) : (
          <Button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full"
            size="sm"
          >
            <Gift className="mr-1.5 h-4 w-4" />
            {claiming ? "Claiming…" : `Claim +${projectedReward} pts`}
          </Button>
        )}

        {milestone && (
          <p className="text-center text-xs text-muted-foreground">
            {milestone.days - (profile.currentStreak ?? 0)} more day
            {milestone.days - (profile.currentStreak ?? 0) === 1 ? "" : "s"} to
            unlock <span className="font-medium">+{milestone.extra}</span> streak
            bonus
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function isContinuingStreak(lastDate: string | null | undefined): boolean {
  if (!lastDate) return false;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return lastDate === d.toISOString().slice(0, 10);
}
