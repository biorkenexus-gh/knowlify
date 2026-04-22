"use client";

import { useEffect, useState } from "react";
import { getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { SearchX } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesCol, progressCol } from "@/lib/firebase/firestore";
import { usePublishedCourses } from "@/lib/hooks/use-course";
import { useAuth } from "@/lib/hooks/use-auth";
import { normalizeQuery } from "@/lib/utils/search-terms";
import type { CategoryDoc } from "@/types";

export default function CoursesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [progressByCourse, setProgressByCourse] = useState<Map<string, number>>(
    new Map()
  );
  const [categoryId, setCategoryId] = useState("");
  const [contentType, setContentType] = useState("");
  const [rawQuery, setRawQuery] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(categoriesCol, orderBy("order", "asc")));
      setCategories(snap.docs.map((d) => d.data()));
    })();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProgressByCourse(new Map());
      return;
    }
    const q = query(progressCol, where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const m = new Map<string, number>();
      snap.docs.forEach((d) => {
        const p = d.data();
        m.set(p.courseId, p.percent ?? 0);
      });
      setProgressByCourse(m);
    });
    return () => unsub();
  }, [user?.uid]);

  const { courses, loading } = usePublishedCourses({
    categoryId: categoryId || undefined,
    contentType: contentType || undefined,
    searchTerm: rawQuery ? normalizeQuery(rawQuery) : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse courses</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} published course{courses.length === 1 ? "" : "s"}
        </p>
      </div>

      <CourseFilters
        categories={categories}
        categoryId={categoryId}
        contentType={contentType}
        rawQuery={rawQuery}
        onCategoryChange={setCategoryId}
        onContentTypeChange={setContentType}
        onQueryChange={setRawQuery}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No courses match those filters"
          description="Try clearing the category, changing the format, or searching for something else."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              progressPercent={progressByCourse.get(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
