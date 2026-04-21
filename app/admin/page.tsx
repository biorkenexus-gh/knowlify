"use client";

import { useEffect, useState } from "react";
import {
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  attemptsCol,
  coursesCol,
  transactionsCol,
  usersCol,
} from "@/lib/firebase/firestore";
import { formatNumber, formatRelative } from "@/lib/utils/format";
import type { AttemptDoc, TransactionDoc } from "@/types";

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({ users: 0, courses: 0, attempts: 0 });
  const [recentAttempts, setRecentAttempts] = useState<AttemptDoc[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionDoc[]>([]);

  useEffect(() => {
    (async () => {
      const [u, c, a] = await Promise.all([
        getCountFromServer(usersCol),
        getCountFromServer(coursesCol),
        getCountFromServer(attemptsCol),
      ]);
      setCounts({
        users: u.data().count,
        courses: c.data().count,
        attempts: a.data().count,
      });
    })();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(attemptsCol, orderBy("submittedAt", "desc"), limit(10)),
      (snap) => setRecentAttempts(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(transactionsCol, orderBy("createdAt", "desc"), limit(10)),
      (snap) => setRecentTx(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, []);

  const stats = [
    { label: "Users", value: counts.users },
    { label: "Courses", value: counts.courses },
    { label: "Attempts", value: counts.attempts },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin overview</h1>
        <p className="text-sm text-muted-foreground">
          A bird&apos;s-eye view of the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(s.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent quiz attempts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentAttempts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <ul className="divide-y">
                {recentAttempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.userId.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(a.submittedAt)} · quiz{" "}
                        {a.quizId.slice(0, 6)}…
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{a.score}%</div>
                      <div
                        className={
                          a.passed
                            ? "text-xs text-emerald-600 dark:text-emerald-400"
                            : "text-xs text-destructive"
                        }
                      >
                        {a.passed ? "passed" : "failed"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTx.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <ul className="divide-y">
                {recentTx.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize">
                        {t.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(t.createdAt)} · {t.userId.slice(0, 8)}…
                      </p>
                    </div>
                    <span
                      className={
                        t.points >= 0
                          ? "font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                          : "font-mono text-sm font-semibold text-destructive"
                      }
                    >
                      {t.points >= 0 ? "+" : ""}
                      {t.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
