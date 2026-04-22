"use client";

import { ArrowRight, Clock, Coins, ListChecks, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuizDoc } from "@/types";

interface QuizIntroProps {
  quiz: QuizDoc;
  questionCount: number;
  onStart(): void;
}

export function QuizIntro({ quiz, questionCount, onStart }: QuizIntroProps) {
  const stats = [
    {
      label: "Questions",
      value: questionCount,
      icon: ListChecks,
    },
    {
      label: "Time limit",
      value: `${Math.round(quiz.timeLimitSeconds / 60)} min`,
      icon: Clock,
    },
    {
      label: "Pass mark",
      value: `${quiz.passingScore}%`,
      icon: Trophy,
    },
    {
      label: "Reward on pass",
      value: `+${quiz.pointsReward} pts`,
      icon: Coins,
    },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Trophy className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            The timer starts the moment you click &quot;Start quiz&quot;.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-sm font-semibold">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <ul className="space-y-1.5 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <li>• You can move between questions before submitting.</li>
            <li>• All questions must be answered before you can submit.</li>
            <li>• The quiz auto-submits when the timer runs out.</li>
            <li>• Points are awarded only on pass — and only once per attempt.</li>
          </ul>

          <Button onClick={onStart} size="lg" className="w-full">
            Start quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
