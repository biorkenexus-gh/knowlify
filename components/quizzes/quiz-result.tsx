"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { PublicQuestion, QuizDoc } from "@/types";
import type { SubmitQuizAttemptResult } from "@/types/attempt";

interface QuizResultProps {
  result: SubmitQuizAttemptResult;
  quiz: QuizDoc;
  questions: PublicQuestion[];
  userAnswers: number[];
}

export function QuizResult({
  result,
  quiz,
  questions,
  userAnswers,
}: QuizResultProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Badge
            variant={result.passed ? "success" : "destructive"}
            className="mx-auto w-fit"
          >
            {result.passed ? "Passed" : "Not passed"}
          </Badge>
          <CardTitle className="text-3xl">
            You scored {result.score}%
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Passing score: {quiz.passingScore}%
          </p>
          {result.pointsAwarded > 0 && (
            <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
              +{result.pointsAwarded} points awarded
            </p>
          )}
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/leaderboard">View leaderboard</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Review</h2>
        {questions.map((q, i) => {
          const correctIdx = result.correctAnswers[i];
          const userIdx = userAnswers[i];
          const correct = userIdx === correctIdx;
          return (
            <Card key={q.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-2">
                  {correct ? (
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="mt-1 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <p className="font-medium">{q.prompt}</p>
                </div>
                <div className="space-y-1.5 pl-6">
                  {q.choices.map((c, ci) => (
                    <div
                      key={ci}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm",
                        ci === correctIdx && "border-emerald-500 bg-emerald-500/10",
                        ci === userIdx &&
                          ci !== correctIdx &&
                          "border-destructive bg-destructive/10"
                      )}
                    >
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {String.fromCharCode(65 + ci)}
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
                {result.explanations[i] && (
                  <p className="pl-6 text-sm text-muted-foreground">
                    <strong>Why:</strong> {result.explanations[i]}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
