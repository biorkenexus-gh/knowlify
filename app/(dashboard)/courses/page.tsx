"use client";

import { useEffect, useState } from "react";
import { getDocs, orderBy, query } from "firebase/firestore";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesCol } from "@/lib/firebase/firestore";
import { usePublishedCourses } from "@/lib/hooks/use-course";
import { normalizeQuery } from "@/lib/utils/search-terms";
import type { CategoryDoc } from "@/types";

export default function CoursesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [contentType, setContentType] = useState("");
  const [rawQuery, setRawQuery] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(categoriesCol, orderBy("order", "asc")));
      setCategories(snap.docs.map((d) => d.data()));
    })();
  }, []);

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
        <div className="rounded-lg border border-dashed py-24 text-center text-muted-foreground">
          No courses match those filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
