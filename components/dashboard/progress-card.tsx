import Link from "next/link";
import { BookMarked } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import type { CourseDoc, ProgressDoc } from "@/types";

export function InProgressList({
  items,
}: {
  items: { course: CourseDoc; progress: ProgressDoc }[];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        title="No courses in progress"
        description="Browse the catalog and start your first lesson to see progress here."
        action={{ label: "Browse courses", href: "/courses" }}
      />
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
