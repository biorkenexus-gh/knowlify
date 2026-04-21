"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useCourse } from "@/lib/hooks/use-course";
import { useProgress } from "@/lib/hooks/use-progress";
import { formatDuration } from "@/lib/utils/format";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { course, lessons, loading } = useCourse(courseId);
  const { progress } = useProgress(courseId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-lg border border-dashed py-24 text-center text-muted-foreground">
        Course not found or not published.
      </div>
    );
  }

  const done = new Set(progress?.completedLessonIds ?? []);
  const percent = progress?.percent ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">{course.categoryName}</Badge>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="max-w-2xl text-muted-foreground">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" /> {course.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.estimatedMinutes)}
            </span>
            <span>
              {course.lessonCount} lesson
              {course.lessonCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your progress</CardTitle>
            <span className="text-sm font-medium">{percent}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={percent} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {lessons.map((lesson, idx) => {
              const complete = done.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate font-medium",
                          complete && "text-muted-foreground line-through"
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(lesson.durationMinutes)} ·{" "}
                        {lesson.contentType} · +{lesson.pointsReward} pts
                      </p>
                    </div>
                    {complete ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
