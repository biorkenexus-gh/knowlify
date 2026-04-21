"use client";

import { useEffect, useState } from "react";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usersCol } from "@/lib/firebase/firestore";
import {
  callAdminDeleteUser,
  callSetUserRole,
} from "@/lib/firebase/functions";
import { formatNumber, formatRelative } from "@/lib/utils/format";
import { ROLES } from "@/lib/constants";
import type { UserDoc, UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(usersCol, orderBy("createdAt", "desc")),
      (snap) => setUsers(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, []);

  async function changeRole(uid: string, role: UserRole) {
    try {
      await callSetUserRole({ userId: uid, role });
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change role");
    }
  }

  async function deleteUser(uid: string) {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    try {
      await callAdminDeleteUser({ userId: uid });
      toast.success("User deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete user");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} account{users.length === 1 ? "" : "s"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium">
                    {u.displayName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(u.points)}</TableCell>
                  <TableCell>{formatRelative(u.createdAt)}</TableCell>
                  <TableCell className="flex items-center justify-end gap-2">
                    <Select
                      value={u.role}
                      onChange={(e) =>
                        changeRole(u.uid, e.target.value as UserRole)
                      }
                      className="h-8 w-28"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(u.uid)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
