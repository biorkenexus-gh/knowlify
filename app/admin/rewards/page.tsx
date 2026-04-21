"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callAdminGrantPoints } from "@/lib/firebase/functions";
import { POINT_VALUES } from "@/lib/constants";

export default function AdminRewardsPage() {
  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState(10);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await callAdminGrantPoints({ userId, points, reason });
      toast.success(`New balance: ${res.data.newBalance}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grant failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rewards</h1>
        <p className="text-sm text-muted-foreground">
          Grant or revoke points manually. All grants are logged in the
          transactions ledger.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current point values (server)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            <li>
              Lesson complete:{" "}
              <strong>{POINT_VALUES.LESSON_COMPLETE}</strong>
            </li>
            <li>
              Quiz pass base:{" "}
              <strong>{POINT_VALUES.QUIZ_PASS_BASE}</strong>{" "}
              <span className="text-muted-foreground">
                (plus each quiz&apos;s own reward)
              </span>
            </li>
            <li>
              Reading session:{" "}
              <strong>{POINT_VALUES.READING_SESSION}</strong>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Edit values by changing <code>functions/src/shared/points.ts</code>{" "}
            and redeploying.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grant / revoke points</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrant} className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Firebase uid"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Points (negative to revoke)</Label>
                <Input
                  type="number"
                  required
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason (logged)</Label>
                <Input
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. workshop bonus"
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Submitting…"
                : points >= 0
                ? "Grant points"
                : "Revoke points"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
