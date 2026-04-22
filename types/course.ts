import type { Timestamp } from "firebase/firestore";

export type ContentType = "pdf" | "video" | "text" | "mixed";
export type CourseStatus = "draft" | "published" | "deleted";

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export interface CourseDoc {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  contentType: ContentType;
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  lessonCount: number;
  estimatedMinutes: number;
  searchTerms: string[];
  status: CourseStatus;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
