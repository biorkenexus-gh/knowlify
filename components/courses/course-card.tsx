import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, User as UserIcon, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils/format";
import type { CourseDoc } from "@/types";

const TYPE_ICON = { pdf: BookOpen, video: Video, text: BookOpen, mixed: BookOpen };

interface CourseCardProps {
  course: CourseDoc;
  progressPercent?: number;
}

export function CourseCard({ course, progressPercent }: CourseCardProps) {
  const Icon = TYPE_ICON[course.contentType] ?? BookOpen;
  const isCompleted =
    progressPercent !== undefined && progressPercent >= 100;
  const isInProgress =
    progressPercent !== undefined && progressPercent > 0 && progressPercent < 100;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative">
          <div
            className="aspect-video w-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/5 bg-cover bg-center"
            style={
              course.coverImageUrl
                ? { backgroundImage: `url(${course.coverImageUrl})` }
                : undefined
            }
          />
          {isCompleted && (
            <Badge
              variant="success"
              className="absolute right-2 top-2 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
          {isInProgress && (
            <Badge
              variant="default"
              className="absolute right-2 top-2"
            >
              In progress
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="shrink-0">
              {course.categoryName}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              {course.contentType}
            </div>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold group-hover:text-primary">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
          {isInProgress && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-foreground">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              {course.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.estimatedMinutes)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
