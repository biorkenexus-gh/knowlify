import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseDoc } from "@/types";

export function RecommendedList({ items }: { items: CourseDoc[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Finish a lesson or two and we&apos;ll recommend more like it.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.slice(0, 4).map((c) => (
        <Link key={c.id} href={`/courses/${c.id}`}>
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardContent className="space-y-1.5 p-4">
              <Badge variant="secondary" className="w-fit">
                {c.categoryName}
              </Badge>
              <p className="font-medium">{c.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {c.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
