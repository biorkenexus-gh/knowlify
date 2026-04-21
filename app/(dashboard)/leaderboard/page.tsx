"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { formatNumber } from "@/lib/utils/format";

export default function LeaderboardPage() {
  const { entries, loading } = useLeaderboard();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Top 100 learners · updates every 5 minutes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All-time rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No entries yet — be the first!
            </div>
          ) : (
            <ul className="divide-y">
              {entries.map((e) => {
                const isYou = user?.uid === e.userId;
                const medal =
                  e.rank === 1
                    ? "🥇"
                    : e.rank === 2
                    ? "🥈"
                    : e.rank === 3
                    ? "🥉"
                    : null;
                return (
                  <li
                    key={e.userId}
                    className={cn(
                      "flex items-center gap-4 px-6 py-3",
                      isYou && "bg-primary/5"
                    )}
                  >
                    <span className="w-8 font-mono text-sm font-semibold">
                      {medal ?? `#${e.rank}`}
                    </span>
                    <Avatar className="h-8 w-8">
                      {e.photoURL && <AvatarImage src={e.photoURL} alt="" />}
                      <AvatarFallback className="text-xs">
                        {e.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate font-medium">
                      {e.displayName}
                      {isYou && (
                        <span className="ml-2 text-xs text-primary">(you)</span>
                      )}
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {formatNumber(e.points)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
