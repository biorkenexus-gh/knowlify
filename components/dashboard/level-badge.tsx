"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { getLevel } from "@/lib/levels";
import { formatNumber } from "@/lib/utils/format";

interface LevelBadgeProps {
  points: number;
  /** "chip" = compact inline version (for topbar). "card" = full dashboard widget. */
  variant?: "chip" | "card";
  className?: string;
}

export function LevelBadge({
  points,
  variant = "chip",
  className,
}: LevelBadgeProps) {
  const { current, next, progress, pointsToNext } = getLevel(points);

  if (variant === "chip") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium ring-1 ring-inset",
          current.ringClass,
          className
        )}
        title={
          next
            ? `${pointsToNext} pts to ${next.name}`
            : "You've reached the top tier!"
        }
      >
        <span aria-hidden>{current.emoji}</span>
        <span className={current.textClass}>{current.name}</span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Your level
          </CardTitle>
          <span className="text-2xl" aria-hidden>
            {current.emoji}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn("text-2xl font-bold", current.textClass)}>
          {current.name}
        </div>
        {next ? (
          <>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              {formatNumber(pointsToNext)} pts to{" "}
              <span className="font-medium text-foreground">{next.name}</span>
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Max tier reached. You&apos;re officially unstoppable.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
