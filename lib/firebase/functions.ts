import { httpsCallable } from "firebase/functions";
import { functions } from "./client";
import type {
  SubmitQuizAttemptInput,
  SubmitQuizAttemptResult,
} from "@/types/attempt";
import type { PublicQuestion } from "@/types/quiz";
import type { UserRole } from "@/types/user";

export const callSubmitQuizAttempt = httpsCallable<
  SubmitQuizAttemptInput,
  SubmitQuizAttemptResult
>(functions, "submitQuizAttempt");

export const callGetQuizQuestions = httpsCallable<
  { quizId: string },
  { questions: PublicQuestion[] }
>(functions, "getQuizQuestions");

export const callSetUserRole = httpsCallable<
  { userId: string; role: UserRole },
  { success: boolean }
>(functions, "setUserRole");

export const callAdminGrantPoints = httpsCallable<
  { userId: string; points: number; reason: string },
  { success: boolean; newBalance: number }
>(functions, "adminGrantPoints");

export const callAdminDeleteUser = httpsCallable<
  { userId: string },
  { success: boolean }
>(functions, "adminDeleteUser");

export const callAdminDeleteContent = httpsCallable<
  { courseId: string; hardDelete?: boolean },
  { success: boolean }
>(functions, "adminDeleteContent");
