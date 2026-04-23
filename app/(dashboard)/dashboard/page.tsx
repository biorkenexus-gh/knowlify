"use client";

import { useEffect, useMemo, useState } from "react";
import {
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsGrid } from "@/components/dashboard/coins-widget";
import { InProgressList } from "@/components/dashboard/progress-card";
import { RecommendedList } from "@/components/dashboard/recommended-list";
import { StreakWidget } from "@/components/dashboard/streak-widget";
import { LevelBadge } from "@/components/dashboard/level-badge";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  coursesCol,
  progressCol,
  transactionsCol,
} from "@/lib/firebase/firestore";
import { formatRelative } from "@/lib/utils/format";
import type { CourseDoc, ProgressDoc, TransactionDoc } from "@/types";

const TX_LABEL: Record<TransactionDoc["type"], string> = {
  lesson_complete: "Lesson completed",
  quiz_pass: "Quiz passed",
  reading_session: "Reading session",
  daily_bonus: "Daily bonus",
  admin_grant: "Admin grant",
  admin_revoke: "Admin revoke",
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [progressItems, setProgressItems] = useState<
    { course: CourseDoc; progress: ProgressDoc }[]
  >([]);
  const [recommended, setRecommended] = useState<CourseDoc[]>([]);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);

  // In-progress courses
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      progressCol,
      where("userId", "==", user.uid),
      orderBy("lastAccessedAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const progresses = snap.docs
        .map((d) => d.data())
        .filter((p) => p.percent < 100);
      if (progresses.length === 0) {
        setProgressItems([]);
        return;
      }
      const courseIds = progresses.map((p) => p.courseId);
      // Firestore `in` clause supports up to 30 values — plenty for top 5.
      const courseSnap = await getDocs(
        query(coursesCol, where(documentId(), "in", courseIds))
      );
      const byId = new Map(courseSnap.docs.map((d) => [d.id, d.data()]));
      setProgressItems(
        progresses
          .map((p) => ({ course: byId.get(p.courseId)!, progress: p }))
          .filter((x) => !!x.course)
      );
    });
    return () => unsub();
  }, [user?.uid]);

  // Recommended: courses in categories the user has touched, excluding already-completed.
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const progSnap = await getDocs(
        query(progressCol, where("userId", "==", user.uid))
      );
      const touchedCourseIds = new Set(progSnap.docs.map((d) => d.data().courseId));
      const completedCourseIds = new Set(
        progSnap.docs
          .map((d) => d.data())
          .filter((p) => p.percent >= 100)
          .map((p) => p.courseId)
      );

      const courseSnap = await getDocs(
        query(
          coursesCol,
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(20)
        )
      );
      const all = courseSnap.docs.map((d) => d.data());
      if (touchedCourseIds.size === 0) {
        setRecommended(all.slice(0, 4));
        return;
      }
      const touchedCategoryIds = new Set(
        all.filter((c) => touchedCourseIds.has(c.id)).map((c) => c.categoryId)
      );
      const picks = all
        .filter(
          (c) =>
            !completedCourseIds.has(c.id) &&
            (touchedCategoryIds.size === 0 ||
              touchedCategoryIds.has(c.categoryId))
        )
        .slice(0, 4);
      setRecommended(picks);
    })();
  }, [user?.uid]);

  // Recent earnings
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      transactionsCol,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) =>
      setTransactions(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, [user?.uid]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.displayName ?? "learner"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s where you stand today.
        </p>
      </div>

      {profile ? (
        <>
          <StatsGrid
            points={profile.points}
            coins={profile.coins}
            completedCourses={profile.completedCourses}
            completedLessons={profile.completedLessons}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <StreakWidget profile={profile} />
            <LevelBadge points={profile.points} variant="card" />
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Keep going</CardTitle>
          </CardHeader>
          <CardContent>
            <InProgressList items={progressItems} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended for you</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendedList items={recommended} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No earnings yet. Complete a lesson to get started.
            </p>
          ) : (
            <ul className="divide-y">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{TX_LABEL[tx.type]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={
                      tx.points >= 0
                        ? "font-semibold text-emerald-600 dark:text-emerald-400"
                        : "font-semibold text-destructive"
                    }
                  >
                    {tx.points >= 0 ? "+" : ""}
                    {tx.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
