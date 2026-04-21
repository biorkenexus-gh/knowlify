"use client";

import { useEffect, useState } from "react";
import { limit, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactionsCol } from "@/lib/firebase/firestore";
import { formatRelative } from "@/lib/utils/format";
import type { TransactionDoc } from "@/types";

export default function AdminActivityPage() {
  const [txs, setTxs] = useState<TransactionDoc[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(transactionsCol, orderBy("createdAt", "desc"), limit(200)),
      (snap) => setTxs(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Last 200 point transactions (newest first).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(t.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {t.userId.slice(0, 10)}…
                  </TableCell>
                  <TableCell className="capitalize">
                    {t.type.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.refCollection ? `${t.refCollection}/${t.refId}` : "—"}
                  </TableCell>
                  <TableCell
                    className={
                      t.points >= 0
                        ? "text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400"
                        : "text-right font-mono font-semibold text-destructive"
                    }
                  >
                    {t.points >= 0 ? "+" : ""}
                    {t.points}
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
