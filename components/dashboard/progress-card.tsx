import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CourseDoc, ProgressDoc } from "@/types";

export function InProgressList({
  items,
}: {
  items: { course: CourseDoc; progress: ProgressDoc }[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No courses in progress yet. Pick one from{" "}
        <Link href="/courses" className="text-primary underline-offset-4 hover:underline">
          browse
        </Link>
        .
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map(({ course, progress }) => (
        <Link
          key={course.id}
          href={`/courses/${course.id}${progress.lastLessonId ? `/lessons/${progress.lastLessonId}` : ""}`}
        >
          <Card className="transition-colors hover:bg-muted/40">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.categoryName}
                  </p>
                </div>
                <span className="text-sm font-medium">{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
