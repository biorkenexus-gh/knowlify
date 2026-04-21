"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { coursesCol, courseDoc } from "@/lib/firebase/firestore";
import { callAdminDeleteContent } from "@/lib/firebase/functions";
import { formatRelative } from "@/lib/utils/format";
import type { CourseDoc } from "@/types";

export default function AdminContentPage() {
  const [courses, setCourses] = useState<CourseDoc[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(coursesCol, orderBy("createdAt", "desc")),
      (snap) => setCourses(snap.docs.map((d) => d.data()))
    );
    return () => unsub();
  }, []);

  async function togglePublish(c: CourseDoc) {
    try {
      const published = !c.published;
      await updateDoc(courseDoc(c.id), {
        published,
        status: published ? "published" : "draft",
        updatedAt: serverTimestamp(),
      });
      toast.success(published ? "Published" : "Unpublished");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    }
  }

  async function del(c: CourseDoc) {
    if (!confirm(`Soft-delete "${c.title}"?`)) return;
    try {
      await callAdminDeleteContent({ courseId: c.id });
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">New course</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All courses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.categoryName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.authorName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "published"
                          ? "success"
                          : c.status === "deleted"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(c.createdAt)}
                  </TableCell>
                  <TableCell className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${c.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(c)}
                    >
                      {c.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => del(c)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
