import { Coins, Sparkles, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";

interface StatsProps {
  points: number;
  coins: number;
  completedCourses: number;
  completedLessons: number;
}

export function StatsGrid({
  points,
  coins,
  completedCourses,
  completedLessons,
}: StatsProps) {
  const stats = [
    { label: "Points", value: points, icon: Sparkles, accent: "text-primary" },
    { label: "Coins", value: coins, icon: Coins, accent: "text-amber-500" },
    {
      label: "Courses done",
      value: completedCourses,
      icon: Trophy,
      accent: "text-emerald-500",
    },
    {
      label: "Lessons done",
      value: completedLessons,
      icon: Sparkles,
      accent: "text-accent-foreground",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
            <s.icon className={`h-4 w-4 ${s.accent}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(s.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
