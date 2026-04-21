"use client";

import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { leaderboardDoc } from "@/lib/firebase/firestore";
import type { LeaderboardEntry } from "@/types";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      leaderboardDoc("all_time"),
      (snap) => {
        setEntries(snap.exists() ? snap.data().entries : []);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { entries, loading };
}
