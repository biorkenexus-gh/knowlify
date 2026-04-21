"use client";

import { useEffect, useState } from "react";
import {
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";
import { transactionsCol, userDoc } from "@/lib/firebase/firestore";
import { formatRelative } from "@/lib/utils/format";
import type { TransactionDoc } from "@/types";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? user?.displayName ?? "");
  }, [profile?.displayName, user?.displayName]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      transactionsCol,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const unsub = onSnapshot(q, (snap) =>
      setTransactions(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, [user?.uid]);

  async function handleSave() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(userDoc(user.uid), {
        displayName: displayName.trim(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile?.displayName ?? user?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your display name and review your earnings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt="" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-xs uppercase tracking-wider text-primary">
                {profile?.role}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              You haven&apos;t earned any points yet.
            </p>
          ) : (
            <ul className="divide-y">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {tx.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={
                      tx.points >= 0
                        ? "font-mono font-semibold text-emerald-600 dark:text-emerald-400"
                        : "font-mono font-semibold text-destructive"
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
