"use client";

// Thin wrapper around react-pdf. We configure the worker from the CDN so the
// app works without a custom webpack rule for `pdf.worker.js`. Long-term, for
// larger files we'd pre-render to images via a Cloud Function.
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({ src }: { src: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-lg border bg-muted/30 p-4">
        <Document
          file={src}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<Skeleton className="h-[700px] w-full" />}
          error={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Could not load PDF.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={800}
            renderTextLayer
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
      {numPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
