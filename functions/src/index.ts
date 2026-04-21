import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

// Exactly one Admin SDK init for the whole codebase.
initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

// Auth
export { onUserCreate } from "./auth/onUserCreate";

// Quizzes
export { submitQuizAttempt } from "./quizzes/submitQuizAttempt";
export { getQuizQuestions } from "./quizzes/getQuizQuestions";

// Lessons / progress
export { awardLessonPoints } from "./lessons/awardLessonPoints";

// Admin
export { setUserRole } from "./admin/setUserRole";
export { adminGrantPoints } from "./admin/adminGrantPoints";
export { adminDeleteUser } from "./admin/adminDeleteUser";
export { adminDeleteContent } from "./admin/adminDeleteContent";

// Leaderboard
export { recomputeLeaderboard } from "./leaderboard/recomputeLeaders";
