"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  arrayUnion,
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/content/video-player";
import { MarkdownReader } from "@/components/content/markdown-reader";

// PdfViewer is browser-only (pdfjs-dist touches DOM globals at import time).
// Loading it via next/dynamic with ssr:false keeps it out of server bundles
// and out of the Vercel build's prerender step.
const PdfViewer = dynamic(
  () => import("@/components/content/pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[700px] w-full" />,
  }
);
import {
  bookmarkDoc,
  lessonDoc,
  progressDoc,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCourse } from "@/lib/hooks/use-course";
import type { LessonDoc } from "@/types";

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const { user } = useAuth();
  const { course, lessons } = useCourse(courseId);
  const [lesson, setLesson] = useState<LessonDoc | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const lessonIdx = useMemo(
    () => lessons.findIndex((l) => l.id === lessonId),
    [lessons, lessonId]
  );
  const prev = lessonIdx > 0 ? lessons[lessonIdx - 1] : null;
  const next = lessonIdx >= 0 && lessonIdx < lessons.length - 1 ? lessons[lessonIdx + 1] : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const snap = await getDoc(lessonDoc(courseId, lessonId));
      if (mounted) setLesson(snap.exists() ? snap.data() : null);
    })();
    return () => {
      mounted = false;
    };
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      bookmarkDoc(user.uid, courseId, lessonId),
      (snap) => setBookmarked(snap.exists())
    );
    return () => unsub();
  }, [user?.uid, courseId, lessonId]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(progressDoc(user.uid, courseId), (snap) => {
      setCompleted(
        snap.exists() &&
          (snap.data().completedLessonIds ?? []).includes(lessonId)
      );
    });
    return () => unsub();
  }, [user?.uid, courseId, lessonId]);

  async function toggleBookmark() {
    if (!user?.uid) return;
    try {
      if (bookmarked) {
        await deleteDoc(bookmarkDoc(user.uid, courseId, lessonId));
        toast.success("Bookmark removed");
      } else {
        // id is stripped by the converter; including it here just satisfies
        // the typed write shape. The deterministic id matches bookmarkDoc().
        await setDoc(bookmarkDoc(user.uid, courseId, lessonId), {
          id: `${user.uid}_${courseId}_${lessonId}`,
          userId: user.uid,
          courseId,
          lessonId,
          createdAt: serverTimestamp(),
        });
        toast.success("Bookmarked");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update bookmark");
    }
  }

  async function markComplete() {
    if (!user?.uid || !lesson || submitting || completed) return;
    setSubmitting(true);
    try {
      // Canonical percent recomputation (server CF will verify).
      const total = Math.max(lessons.length, 1);
      const progressSnap = await getDoc(progressDoc(user.uid, courseId));
      const already = progressSnap.exists()
        ? new Set<string>(progressSnap.data().completedLessonIds ?? [])
        : new Set<string>();
      already.add(lessonId);
      const percent = Math.min(100, Math.round((already.size / total) * 100));
      await setDoc(
        progressDoc(user.uid, courseId),
        {
          userId: user.uid,
          courseId,
          completedLessonIds: arrayUnion(lessonId) as unknown as string[],
          lastLessonId: lessonId,
          percent,
          lastAccessedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAt: progressSnap.exists() ? progressSnap.data().createdAt : serverTimestamp(),
        },
        { merge: true }
      );
      toast.success(`Lesson complete · +${lesson.pointsReward} pts`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mark complete");
    } finally {
      setSubmitting(false);
    }
  }

  if (!lesson || !course) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: course.title, href: `/courses/${course.id}` },
          { label: lesson.title },
        ]}
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            Lesson {lessonIdx + 1} of {lessons.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleBookmark}>
            {bookmarked ? (
              <>
                <BookmarkCheck className="mr-1.5 h-4 w-4" /> Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="mr-1.5 h-4 w-4" /> Bookmark
              </>
            )}
          </Button>
          <Button
            onClick={markComplete}
            disabled={completed || submitting}
            size="sm"
          >
            {completed ? (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Completed
              </>
            ) : submitting ? (
              "Saving…"
            ) : (
              `Mark complete · +${lesson.pointsReward} pts`
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          {lesson.contentType === "pdf" && lesson.contentUrl && (
            <PdfViewer src={lesson.contentUrl} />
          )}
          {lesson.contentType === "video" && lesson.contentUrl && (
            <VideoPlayer src={lesson.contentUrl} />
          )}
          {lesson.contentType === "text" && lesson.body && (
            <MarkdownReader body={lesson.body} />
          )}
        </CardContent>
      </Card>

      {lesson.quizId && (
        <Card>
          <CardHeader>
            <CardTitle>Test yourself</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              A quiz is attached to this lesson. Pass it to earn bonus points.
            </p>
            <Button asChild>
              <Link href={`/quizzes/${lesson.quizId}`}>Take quiz</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        {prev ? (
          <Button variant="ghost" asChild>
            <Link href={`/courses/${course.id}/lessons/${prev.id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" /> {prev.title}
            </Link>
          </Button>
        ) : <div />}
        {next ? (
          <Button variant="ghost" asChild>
            <Link href={`/courses/${course.id}/lessons/${next.id}`}>
              {next.title} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : <div />}
      </div>
    </div>
  );
}
