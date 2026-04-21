"use client";

import { use, useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizRunner } from "@/components/quizzes/quiz-runner";
import { quizDoc } from "@/lib/firebase/firestore";
import {
  callGetQuizQuestions,
  callSubmitQuizAttempt,
} from "@/lib/firebase/functions";
import type { PublicQuestion, QuizDoc } from "@/types";

export default function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const [quiz, setQuiz] = useState<QuizDoc | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [quizSnap, qsResp] = await Promise.all([
          getDoc(quizDoc(quizId)),
          callGetQuizQuestions({ quizId }),
        ]);
        if (!quizSnap.exists()) {
          setError("Quiz not found");
        } else {
          setQuiz(quizSnap.data());
          setQuestions(qsResp.data.questions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load quiz");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="rounded-lg border border-dashed py-24 text-center text-muted-foreground">
        {error ?? "Quiz not found."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground">
          Time limit: {Math.round(quiz.timeLimitSeconds / 60)} min · Passing
          score: {quiz.passingScore}% · Reward: +{quiz.pointsReward} pts on pass
        </p>
      </div>
      <QuizRunner
        quiz={quiz}
        questions={questions}
        onSubmit={async ({ answers, timeTakenSeconds, clientNonce }) => {
          try {
            const res = await callSubmitQuizAttempt({
              quizId,
              answers,
              timeTakenSeconds,
              clientNonce,
            });
            return res.data;
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Could not submit quiz";
            toast.error(msg);
            throw err;
          }
        }}
      />
    </div>
  );
}
