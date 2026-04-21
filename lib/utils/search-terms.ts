// Builds the lowercased, deduped token array we store on `courses.searchTerms`.
// Used by the `/courses` page to filter via `array-contains` on simple queries.
// Good enough until traffic justifies Algolia.
export function buildSearchTerms(...sources: string[]): string[] {
  const tokens = sources
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t.length <= 24);
  return Array.from(new Set(tokens));
}

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
