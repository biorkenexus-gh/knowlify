import type { Timestamp } from "firebase/firestore";

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatDate(ts: Timestamp | Date | null | undefined): string {
  if (!ts) return "—";
  const d = ts instanceof Date ? ts : ts.toDate();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(ts: Timestamp | Date | null | undefined): string {
  if (!ts) return "—";
  const d = ts instanceof Date ? ts : ts.toDate();
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
