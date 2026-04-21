"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownReader({ body }: { body: string }) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown>{body}</ReactMarkdown>
    </article>
  );
}
