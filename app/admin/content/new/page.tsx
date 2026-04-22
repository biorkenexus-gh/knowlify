"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  categoriesCol,
  coursesCol,
  lessonsCol,
} from "@/lib/firebase/firestore";
import { buildSearchTerms } from "@/lib/utils/search-terms";
import type { CategoryDoc, ContentType } from "@/types";

interface LessonDraft {
  title: string;
  contentType: "pdf" | "video" | "text";
  body: string;
  contentUrl: string;
  durationMinutes: number;
  pointsReward: number;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentType, setContentType] = useState<ContentType>("text");
  const [categoryId, setCategoryId] = useState("");
  const [lessons, setLessons] = useState<LessonDraft[]>([
    {
      title: "",
      contentType: "text",
      body: "",
      contentUrl: "",
      durationMinutes: 10,
      pointsReward: 10,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(categoriesCol, orderBy("order", "asc")));
      const cats = snap.docs.map((d) => d.data());
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateLesson(idx: number, patch: Partial<LessonDraft>) {
    setLessons((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return toast.error("Pick a category");
    setSubmitting(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const estimatedMinutes = lessons.reduce(
        (sum, l) => sum + (l.durationMinutes || 0),
        0
      );
      const courseRef = await addDoc(coursesCol, {
        id: "",
        title,
        slug,
        description,
        coverImageUrl,
        contentType,
        categoryId: category.id,
        categoryName: category.name,
        authorId: user.uid,
        authorName: profile.displayName,
        lessonCount: lessons.length,
        estimatedMinutes,
        searchTerms: buildSearchTerms(title, description, category.name),
        status: "published",
        published: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: serverTimestamp() as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: serverTimestamp() as any,
      });

      await Promise.all(
        lessons.map((l, idx) =>
          addDoc(lessonsCol(courseRef.id), {
            id: "",
            title: l.title,
            order: idx,
            contentType: l.contentType,
            contentUrl: l.contentUrl || null,
            body: l.contentType === "text" ? l.body : null,
            durationMinutes: l.durationMinutes,
            quizId: null,
            pointsReward: l.pointsReward,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createdAt: serverTimestamp() as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updatedAt: serverTimestamp() as any,
          })
        )
      );

      toast.success("Course published");
      router.push(`/courses/${courseRef.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content" },
          { label: "New course" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold">New course</h1>
        <p className="text-sm text-muted-foreground">
          Basic MVP form — for heavy files upload directly to Storage via the
          Firebase Console and paste the URL below.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Primary format</Label>
              <Select
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as ContentType)
                }
              >
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="mixed">Mixed</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cover image URL</Label>
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lessons</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLessons((ls) => [
                ...ls,
                {
                  title: "",
                  contentType: "text",
                  body: "",
                  contentUrl: "",
                  durationMinutes: 10,
                  pointsReward: 10,
                },
              ])
            }
          >
            Add lesson
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lessons.map((l, idx) => (
            <div key={idx} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Lesson {idx + 1}
                </span>
                {lessons.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLessons((ls) => ls.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Input
                required
                placeholder="Title"
                value={l.title}
                onChange={(e) => updateLesson(idx, { title: e.target.value })}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <Select
                  value={l.contentType}
                  onChange={(e) =>
                    updateLesson(idx, {
                      contentType: e.target.value as LessonDraft["contentType"],
                    })
                  }
                >
                  <option value="text">Text / markdown</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </Select>
                <Input
                  type="number"
                  min={1}
                  placeholder="Duration (min)"
                  value={l.durationMinutes}
                  onChange={(e) =>
                    updateLesson(idx, {
                      durationMinutes: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Points reward"
                  value={l.pointsReward}
                  onChange={(e) =>
                    updateLesson(idx, { pointsReward: Number(e.target.value) })
                  }
                />
              </div>
              {l.contentType === "text" ? (
                <Textarea
                  rows={6}
                  placeholder="Markdown content"
                  value={l.body}
                  onChange={(e) => updateLesson(idx, { body: e.target.value })}
                />
              ) : (
                <Input
                  placeholder={
                    l.contentType === "pdf"
                      ? "PDF URL (Firebase Storage)"
                      : "Video URL"
                  }
                  value={l.contentUrl}
                  onChange={(e) =>
                    updateLesson(idx, { contentUrl: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Publishing…" : "Publish course"}
      </Button>
    </form>
  );
}
