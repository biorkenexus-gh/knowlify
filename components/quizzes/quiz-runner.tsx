"use client";

import { useEffect, useMemo, useState } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { formatSeconds } from "@/lib/utils/format";
import type { PublicQuestion, QuizDoc } from "@/types";
import type { SubmitQuizAttemptResult } from "@/types/attempt";
import { QuizResult } from "./quiz-result";

interface QuizRunnerProps {
  quiz: QuizDoc;
  questions: PublicQuestion[];
  onSubmit(args: {
    answers: number[];
    timeTakenSeconds: number;
    clientNonce: string;
  }): Promise<SubmitQuizAttemptResult>;
}

export function QuizRunner({ quiz, questions, onSubmit }: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    () => Array(questions.length).fill(-1)
  );
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitQuizAttemptResult | null>(null);

  const clientNonce = useMemo(
    () => `${startedAt}-${Math.random().toString(36).slice(2, 10)}`,
    [startedAt]
  );

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.floor((now - startedAt) / 1000);
  const timeLeft = Math.max(0, quiz.timeLimitSeconds - elapsed);
  const question = questions[index];
  const answered = answers.filter((a) => a >= 0).length;

  useEffect(() => {
    if (timeLeft === 0 && !result && !submitting) {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function choose(choiceIdx: number) {
    setAnswers((a) => {
      const next = [...a];
      next[index] = choiceIdx;
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await onSubmit({
        answers,
        timeTakenSeconds: elapsed,
        clientNonce,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <QuizResult result={result} quiz={quiz} questions={questions} userAnswers={answers} />;
  }

  if (!question) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No questions available.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {index + 1} of {questions.length} · {answered} answered
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium",
            timeLeft < 30 && "border-destructive text-destructive"
          )}
        >
          <Timer className="h-4 w-4" />
          {formatSeconds(timeLeft)}
        </div>
      </div>
      <Progress value={(index / questions.length) * 100} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {question.choices.map((choice, i) => {
            const selected = answers[index] === i;
            return (
              <button
                type="button"
                key={i}
                onClick={() => choose(i)}
                className={cn(
                  "w-full rounded-md border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/50 hover:bg-muted/40"
                )}
              >
                <span className="mr-3 font-mono text-xs text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        {index < questions.length - 1 ? (
          <Button
            disabled={answers[index] < 0}
            onClick={() =>
              setIndex((i) => Math.min(questions.length - 1, i + 1))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || answered < questions.length}
          >
            {submitting ? "Submitting…" : "Submit quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
