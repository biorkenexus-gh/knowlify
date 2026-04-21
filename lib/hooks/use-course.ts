"use client";

import { useEffect, useState } from "react";
import {
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  courseDoc,
  coursesCol,
  lessonsCol,
} from "@/lib/firebase/firestore";
import type { CourseDoc, LessonDoc } from "@/types";

export interface CoursesFilter {
  categoryId?: string;
  contentType?: string;
  searchTerm?: string;
}

export function usePublishedCourses(filter: CoursesFilter = {}) {
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const clauses = [where("published", "==", true)];
    if (filter.categoryId) {
      clauses.push(where("categoryId", "==", filter.categoryId));
    }
    if (filter.contentType) {
      clauses.push(where("contentType", "==", filter.contentType));
    }
    if (filter.searchTerm) {
      clauses.push(where("searchTerms", "array-contains", filter.searchTerm));
    }

    const q = query(coursesCol, ...clauses, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCourses(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [filter.categoryId, filter.contentType, filter.searchTerm]);

  return { courses, loading, error };
}

export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<CourseDoc | null>(null);
  const [lessons, setLessons] = useState<LessonDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      const [courseSnap, lessonSnap] = await Promise.all([
        getDoc(courseDoc(courseId)),
        getDocs(query(lessonsCol(courseId), orderBy("order", "asc"))),
      ]);
      if (!mounted) return;
      setCourse(courseSnap.exists() ? courseSnap.data() : null);
      setLessons(lessonSnap.docs.map((d) => d.data()));
      setLoading(false);
    })().catch(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [courseId]);

  return { course, lessons, loading };
}
