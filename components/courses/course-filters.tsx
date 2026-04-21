"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { normalizeQuery } from "@/lib/utils/search-terms";
import type { CategoryDoc } from "@/types";

interface CourseFiltersProps {
  categories: CategoryDoc[];
  categoryId: string;
  contentType: string;
  rawQuery: string;
  onCategoryChange(id: string): void;
  onContentTypeChange(type: string): void;
  onQueryChange(q: string): void;
}

export function CourseFilters({
  categories,
  categoryId,
  contentType,
  rawQuery,
  onCategoryChange,
  onContentTypeChange,
  onQueryChange,
}: CourseFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses…"
          className="pl-9"
          value={rawQuery}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <Select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="md:w-48"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        value={contentType}
        onChange={(e) => onContentTypeChange(e.target.value)}
        className="md:w-40"
      >
        <option value="">All formats</option>
        <option value="pdf">PDF</option>
        <option value="video">Video</option>
        <option value="text">Text</option>
        <option value="mixed">Mixed</option>
      </Select>
      {rawQuery && (
        <div className="text-xs text-muted-foreground md:ml-2">
          Searching for: <code>{normalizeQuery(rawQuery)}</code>
        </div>
      )}
    </div>
  );
}
