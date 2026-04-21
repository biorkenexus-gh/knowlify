/**
 * Knowlify local seed script.
 *
 * Populates the emulator with:
 *   - 5 categories
 *   - 3 users (admin / teacher / student), all password "password123"
 *   - 6 sample courses across categories + formats
 *   - Each course has 3-5 lessons
 *   - Each course has one 5-question quiz
 *
 * Usage (emulators must be running):
 *   pnpm seed
 */

import { cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? "knowlify-dev";

let app: App;
if (process.env.FIRESTORE_EMULATOR_HOST) {
  // Emulator mode — no credentials needed.
  app = initializeApp({ projectId: PROJECT_ID });
  console.log(
    `[seed] connected to emulators (firestore=${process.env.FIRESTORE_EMULATOR_HOST}, auth=${process.env.FIREBASE_AUTH_EMULATOR_HOST})`
  );
} else {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
  console.log("[seed] connected to REAL Firebase project — are you sure?");
}

const db = getFirestore(app);
const auth = getAuth(app);

const CATEGORIES = [
  { id: "programming", name: "Programming", slug: "programming", icon: "Code", order: 0 },
  { id: "design", name: "Design", slug: "design", icon: "Palette", order: 1 },
  { id: "business", name: "Business", slug: "business", icon: "Briefcase", order: 2 },
  { id: "languages", name: "Languages", slug: "languages", icon: "Languages", order: 3 },
  { id: "science", name: "Science", slug: "science", icon: "FlaskConical", order: 4 },
];

const USERS = [
  {
    email: "admin@knowlify.test",
    password: "password123",
    displayName: "Ada Admin",
    role: "admin",
  },
  {
    email: "teacher@knowlify.test",
    password: "password123",
    displayName: "Teresa Teacher",
    role: "teacher",
  },
  {
    email: "student@knowlify.test",
    password: "password123",
    displayName: "Sam Student",
    role: "student",
  },
];

interface SeedLesson {
  title: string;
  contentType: "text" | "pdf" | "video";
  body?: string;
  contentUrl?: string;
  durationMinutes: number;
  pointsReward: number;
}

interface SeedCourse {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  contentType: "text" | "pdf" | "video" | "mixed";
  lessons: SeedLesson[];
  quiz: {
    title: string;
    passingScore: number;
    pointsReward: number;
    timeLimitSeconds: number;
    questions: {
      prompt: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
}

const COURSES: SeedCourse[] = [
  {
    id: "js-foundations",
    title: "JavaScript Foundations",
    description: "Variables, functions, async — the basics done right.",
    categoryId: "programming",
    contentType: "text",
    lessons: [
      {
        title: "Values and variables",
        contentType: "text",
        body: "# Values and variables\n\nJavaScript has two kinds of values: primitives (numbers, strings, booleans) and objects. Variables are labels for values.\n\n```js\nconst name = 'Ada';\nlet count = 0;\n```\n\n`const` bindings can't be reassigned — prefer them by default.",
        durationMinutes: 8,
        pointsReward: 10,
      },
      {
        title: "Functions",
        contentType: "text",
        body: "# Functions\n\nFunctions are first-class: you can store them in variables, pass them around, return them. The modern way to write one is the arrow function:\n\n```js\nconst double = (n) => n * 2;\n```\n\nPure functions — same input, same output, no side effects — are the easiest to reason about.",
        durationMinutes: 10,
        pointsReward: 10,
      },
      {
        title: "Async and promises",
        contentType: "text",
        body: "# Async and promises\n\nJavaScript is single-threaded but non-blocking. Promises represent a future value.\n\n```js\nconst data = await fetch('/api').then(r => r.json());\n```\n\n`async/await` is almost always the right call over raw `.then()` chains.",
        durationMinutes: 12,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "JavaScript Foundations Quiz",
      passingScore: 70,
      pointsReward: 50,
      timeLimitSeconds: 300,
      questions: [
        {
          prompt: "Which keyword creates a binding that can't be reassigned?",
          choices: ["var", "let", "const", "fix"],
          correctIndex: 2,
          explanation: "`const` prevents reassignment of the binding.",
        },
        {
          prompt: "What does an arrow function NOT have of its own?",
          choices: ["Return value", "Parameters", "`this` binding", "Body"],
          correctIndex: 2,
          explanation: "Arrow functions inherit `this` from their enclosing scope.",
        },
        {
          prompt: "Which is the cleanest way to await a fetch?",
          choices: [
            "fetch().done()",
            "const r = await fetch(url)",
            "fetch.sync(url)",
            "fetch(url).wait()",
          ],
          correctIndex: 1,
          explanation: "`await` is the idiomatic approach inside async functions.",
        },
        {
          prompt: "A 'pure function' is one that…",
          choices: [
            "Mutates global state",
            "Always returns undefined",
            "Has no side effects and returns the same output for the same input",
            "Is declared with the `pure` keyword",
          ],
          correctIndex: 2,
          explanation: "Purity = no side effects + deterministic.",
        },
        {
          prompt: "Which of these is a primitive?",
          choices: ["Array", "Object", "String", "Map"],
          correctIndex: 2,
          explanation: "Strings are primitives; the others are objects.",
        },
      ],
    },
  },
  {
    id: "design-principles",
    title: "Visual Design Principles",
    description: "Hierarchy, contrast, alignment, and why your button looks off.",
    categoryId: "design",
    contentType: "text",
    lessons: [
      {
        title: "Contrast",
        contentType: "text",
        body: "# Contrast\n\nContrast is how you tell users 'this is more important than that'. Use it between sizes, colors, weights, and textures.",
        durationMinutes: 6,
        pointsReward: 10,
      },
      {
        title: "Alignment",
        contentType: "text",
        body: "# Alignment\n\nPick a grid and stick to it. Invisible alignment lines make layouts feel effortless.",
        durationMinutes: 7,
        pointsReward: 10,
      },
      {
        title: "Repetition",
        contentType: "text",
        body: "# Repetition\n\nReusing colors, shapes, and spacing creates familiarity and reduces cognitive load.",
        durationMinutes: 5,
        pointsReward: 10,
      },
      {
        title: "Proximity",
        contentType: "text",
        body: "# Proximity\n\nElements that belong together should be visually closer. Whitespace is a grouping signal.",
        durationMinutes: 5,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "Design Principles Quiz",
      passingScore: 70,
      pointsReward: 40,
      timeLimitSeconds: 240,
      questions: [
        {
          prompt: "Contrast is primarily used to…",
          choices: [
            "Make things pretty",
            "Signal relative importance",
            "Follow trends",
            "Use less whitespace",
          ],
          correctIndex: 1,
          explanation: "Contrast communicates hierarchy.",
        },
        {
          prompt: "Which principle says related items should be grouped together?",
          choices: ["Alignment", "Contrast", "Proximity", "Repetition"],
          correctIndex: 2,
          explanation: "Proximity = perceived grouping.",
        },
        {
          prompt: "Which is a typical grid subdivision on the web?",
          choices: ["3-col", "5-col", "12-col", "8-col"],
          correctIndex: 2,
          explanation: "12 divides cleanly into 2, 3, 4, 6.",
        },
        {
          prompt: "Good whitespace is…",
          choices: [
            "Wasted space",
            "A grouping and emphasis tool",
            "Only for print",
            "Random",
          ],
          correctIndex: 1,
          explanation: "Whitespace is a deliberate tool.",
        },
        {
          prompt: "Repetition helps by…",
          choices: [
            "Confusing users",
            "Creating consistency and familiarity",
            "Filling empty space",
            "Adding noise",
          ],
          correctIndex: 1,
          explanation: "Repetition builds visual rhythm.",
        },
      ],
    },
  },
  {
    id: "intro-entrepreneurship",
    title: "Intro to Entrepreneurship",
    description: "From idea to first customer without burning out.",
    categoryId: "business",
    contentType: "text",
    lessons: [
      {
        title: "Finding a real problem",
        contentType: "text",
        body: "# Finding a real problem\n\nIdeas are cheap. Validated problems are gold. Talk to ten prospects before writing any code.",
        durationMinutes: 10,
        pointsReward: 10,
      },
      {
        title: "Minimum viable product",
        contentType: "text",
        body: "# Minimum viable product\n\nThe smallest thing you can build that tests your riskiest assumption. Not the smallest feature-complete version.",
        durationMinutes: 10,
        pointsReward: 10,
      },
      {
        title: "Your first ten customers",
        contentType: "text",
        body: "# Your first ten customers\n\nThese don't scale — you get them by hand. That's the point.",
        durationMinutes: 9,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "Entrepreneurship Quiz",
      passingScore: 60,
      pointsReward: 40,
      timeLimitSeconds: 240,
      questions: [
        {
          prompt: "An MVP is…",
          choices: [
            "A finished product",
            "The smallest version that tests your riskiest assumption",
            "A marketing campaign",
            "A team size",
          ],
          correctIndex: 1,
          explanation: "MVP = learning tool, not feature set.",
        },
        {
          prompt: "What should you do before writing code?",
          choices: [
            "Hire a team",
            "Validate that someone actually has the problem",
            "Raise money",
            "File for a patent",
          ],
          correctIndex: 1,
          explanation: "Validation beats building.",
        },
        {
          prompt: "Early customer acquisition should be…",
          choices: ["Fully automated", "Manual and hands-on", "Outsourced", "Viral"],
          correctIndex: 1,
          explanation: "Do things that don't scale.",
        },
        {
          prompt: "What is product-market fit?",
          choices: [
            "When you ship on time",
            "When your market obviously wants what you're building",
            "When your team agrees on the spec",
            "When you have a logo",
          ],
          correctIndex: 1,
          explanation: "You feel the pull when there's fit.",
        },
        {
          prompt: "How many prospects should you interview before building?",
          choices: ["0", "1", "At least several", "100+"],
          correctIndex: 2,
          explanation: "Multiple interviews surface patterns.",
        },
      ],
    },
  },
  {
    id: "spanish-basics",
    title: "Spanish — Survival Phrases",
    description: "Say hello, order food, and ask directions. That's a start.",
    categoryId: "languages",
    contentType: "text",
    lessons: [
      {
        title: "Greetings",
        contentType: "text",
        body: "# Greetings\n\n- Hola — hi\n- Buenos días — good morning\n- ¿Cómo estás? — how are you?\n- Gracias — thank you",
        durationMinutes: 5,
        pointsReward: 10,
      },
      {
        title: "At a restaurant",
        contentType: "text",
        body: "# At a restaurant\n\n- La carta, por favor — the menu please\n- La cuenta — the check\n- Agua con gas — sparkling water",
        durationMinutes: 6,
        pointsReward: 10,
      },
      {
        title: "Asking directions",
        contentType: "text",
        body: "# Asking directions\n\n- ¿Dónde está…? — where is…?\n- A la izquierda — to the left\n- A la derecha — to the right",
        durationMinutes: 5,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "Spanish Survival Quiz",
      passingScore: 60,
      pointsReward: 30,
      timeLimitSeconds: 180,
      questions: [
        {
          prompt: "How do you say 'thank you'?",
          choices: ["Hola", "Adiós", "Gracias", "Perdón"],
          correctIndex: 2,
          explanation: "Gracias = thanks.",
        },
        {
          prompt: "¿Dónde está…? means…",
          choices: [
            "How much is it?",
            "Where is…?",
            "What time is it?",
            "I'm hungry.",
          ],
          correctIndex: 1,
          explanation: "Literally 'where is…?'",
        },
        {
          prompt: "A la izquierda means…",
          choices: ["To the right", "To the left", "Straight ahead", "Behind"],
          correctIndex: 1,
          explanation: "Izquierda = left.",
        },
        {
          prompt: "You'd ask for the check by saying…",
          choices: [
            "La cuenta",
            "La carta",
            "El agua",
            "La fiesta",
          ],
          correctIndex: 0,
          explanation: "La cuenta = the bill.",
        },
        {
          prompt: "Hola means…",
          choices: ["Goodbye", "Hello", "Sorry", "Yes"],
          correctIndex: 1,
          explanation: "Everyone knows this one.",
        },
      ],
    },
  },
  {
    id: "physics-motion",
    title: "Physics: Motion & Forces",
    description: "Newton's laws, with the hand-waving removed.",
    categoryId: "science",
    contentType: "text",
    lessons: [
      {
        title: "First law: inertia",
        contentType: "text",
        body: "# Newton's First Law\n\nAn object in motion stays in motion unless a net force acts on it. In other words, 'nothing accelerates itself'.",
        durationMinutes: 8,
        pointsReward: 10,
      },
      {
        title: "Second law: F = ma",
        contentType: "text",
        body: "# Newton's Second Law\n\nForce equals mass times acceleration. The bigger the mass, the more force you need to accelerate it the same amount.",
        durationMinutes: 9,
        pointsReward: 10,
      },
      {
        title: "Third law: action/reaction",
        contentType: "text",
        body: "# Newton's Third Law\n\nFor every action there is an equal and opposite reaction. Push on the wall, the wall pushes back with the same force.",
        durationMinutes: 7,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "Motion Quiz",
      passingScore: 70,
      pointsReward: 40,
      timeLimitSeconds: 240,
      questions: [
        {
          prompt: "Newton's first law is about…",
          choices: ["Gravity", "Inertia", "Action/reaction", "Energy"],
          correctIndex: 1,
          explanation: "It's the law of inertia.",
        },
        {
          prompt: "F = ma means force equals…",
          choices: [
            "Mass plus acceleration",
            "Mass minus acceleration",
            "Mass times acceleration",
            "Mass divided by acceleration",
          ],
          correctIndex: 2,
          explanation: "Classic.",
        },
        {
          prompt: "If you double the mass but keep acceleration the same, the force…",
          choices: ["Halves", "Stays the same", "Doubles", "Quadruples"],
          correctIndex: 2,
          explanation: "F scales linearly with mass.",
        },
        {
          prompt: "Newton's third law says…",
          choices: [
            "Energy is conserved",
            "Forces come in equal-and-opposite pairs",
            "Everything falls at the same rate",
            "Gravity is universal",
          ],
          correctIndex: 1,
          explanation: "Every action, equal opposite reaction.",
        },
        {
          prompt: "An object with no net force acting on it…",
          choices: [
            "Must be at rest",
            "Must be speeding up",
            "Moves at constant velocity (which may be zero)",
            "Explodes",
          ],
          correctIndex: 2,
          explanation: "Zero net force ⇒ zero acceleration, not zero velocity.",
        },
      ],
    },
  },
  {
    id: "leading-teams",
    title: "Leading Small Teams",
    description: "The people-management skills nobody taught you in school.",
    categoryId: "business",
    contentType: "text",
    lessons: [
      {
        title: "Set the bar",
        contentType: "text",
        body: "# Set the bar\n\nYour team mirrors your standards. If you accept late work, you'll get late work. Set the bar explicitly.",
        durationMinutes: 7,
        pointsReward: 10,
      },
      {
        title: "Give feedback early",
        contentType: "text",
        body: "# Give feedback early\n\nFeedback delivered within 24 hours is 10x more useful than feedback at the annual review.",
        durationMinutes: 6,
        pointsReward: 10,
      },
      {
        title: "1:1s that matter",
        contentType: "text",
        body: "# 1:1s that matter\n\nAgenda driven by the report, not the manager. Listen more than you speak. Ask 'what's hard?'",
        durationMinutes: 8,
        pointsReward: 10,
      },
    ],
    quiz: {
      title: "Leading Teams Quiz",
      passingScore: 60,
      pointsReward: 30,
      timeLimitSeconds: 240,
      questions: [
        {
          prompt: "Who should drive a 1:1 agenda?",
          choices: ["The manager", "The report", "HR", "No one"],
          correctIndex: 1,
          explanation: "Make it useful to the person you're listening to.",
        },
        {
          prompt: "Effective feedback is…",
          choices: ["Delayed", "Immediate and specific", "Anonymous", "Public"],
          correctIndex: 1,
          explanation: "Fast + specific = actionable.",
        },
        {
          prompt: "Your team's output tends to match…",
          choices: [
            "The company mission",
            "The standards you set and enforce",
            "The weather",
            "Industry average",
          ],
          correctIndex: 1,
          explanation: "You are the bar.",
        },
        {
          prompt: "Best way to find out what's blocking your team?",
          choices: [
            "Send a survey once a year",
            "Ask 'what's hard right now?'",
            "Read their Slack",
            "Wait for them to escalate",
          ],
          correctIndex: 1,
          explanation: "Direct questions get direct answers.",
        },
        {
          prompt: "Delayed feedback is typically…",
          choices: [
            "More thoughtful",
            "Less useful",
            "Preferred by reports",
            "Required by HR",
          ],
          correctIndex: 1,
          explanation: "Memory fades; relevance fades faster.",
        },
      ],
    },
  },
];

async function seed() {
  console.log("[seed] starting…");

  // Users
  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    let existing;
    try {
      existing = await auth.getUserByEmail(u.email);
    } catch {
      // not found
    }
    const rec = existing
      ? existing
      : await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.displayName,
        });
    userIds[u.role] = rec.uid;
    await auth.setCustomUserClaims(rec.uid, { role: u.role });
    await db
      .collection("users")
      .doc(rec.uid)
      .set(
        {
          uid: rec.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: null,
          role: u.role,
          points: 0,
          coins: 0,
          completedCourses: 0,
          completedLessons: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    console.log(`[seed] user ${u.email} · ${u.role}`);
  }

  const teacherId = userIds["teacher"];
  const teacherName = USERS.find((u) => u.role === "teacher")!.displayName;

  // Categories
  for (const c of CATEGORIES) {
    await db.collection("categories").doc(c.id).set(c, { merge: true });
  }
  console.log(`[seed] ${CATEGORIES.length} categories`);

  // Courses + lessons + quizzes
  for (const course of COURSES) {
    const cat = CATEGORIES.find((c) => c.id === course.categoryId)!;
    const searchTerms = Array.from(
      new Set(
        (course.title + " " + course.description + " " + cat.name)
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((t) => t.length >= 2)
      )
    );

    const estimated = course.lessons.reduce(
      (s, l) => s + l.durationMinutes,
      0
    );

    await db.collection("courses").doc(course.id).set({
      title: course.title,
      slug: course.id,
      description: course.description,
      coverImageUrl: "",
      contentType: course.contentType,
      categoryId: cat.id,
      categoryName: cat.name,
      authorId: teacherId,
      authorName: teacherName,
      lessonCount: course.lessons.length,
      estimatedMinutes: estimated,
      searchTerms,
      status: "published",
      published: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create quiz first so we can reference its id from the last lesson
    const quizRef = await db.collection("quizzes").add({
      title: course.quiz.title,
      courseId: course.id,
      lessonId: null,
      timeLimitSeconds: course.quiz.timeLimitSeconds,
      passingScore: course.quiz.passingScore,
      pointsReward: course.quiz.pointsReward,
      questionCount: course.quiz.questions.length,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    for (let i = 0; i < course.quiz.questions.length; i++) {
      const q = course.quiz.questions[i];
      await quizRef.collection("questions").add({
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: i,
      });
    }

    for (let i = 0; i < course.lessons.length; i++) {
      const l = course.lessons[i];
      const isLast = i === course.lessons.length - 1;
      await db
        .collection("courses")
        .doc(course.id)
        .collection("lessons")
        .add({
          title: l.title,
          order: i,
          contentType: l.contentType,
          contentUrl: l.contentUrl ?? null,
          body: l.body ?? null,
          durationMinutes: l.durationMinutes,
          pointsReward: l.pointsReward,
          quizId: isLast ? quizRef.id : null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }

    console.log(
      `[seed] course ${course.id} (${course.lessons.length} lessons, ${course.quiz.questions.length} quiz questions)`
    );
  }

  console.log("[seed] done ✅");
  console.log("\nTry it out:");
  for (const u of USERS) {
    console.log(`  ${u.email} / ${u.password} (${u.role})`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
