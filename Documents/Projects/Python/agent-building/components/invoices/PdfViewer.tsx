'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf to avoid SSR crash
const ReactPdfDocument = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false, loading: () => <div className="p-4 text-sm text-gray-500">Loading PDF viewer…</div> }
);

const ReactPdfPage = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

// Set up the worker — must be done client-side only
if (typeof window !== 'undefined') {
  void import('react-pdf').then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  });
}

interface PdfViewerProps {
  fileUrl: string;
}

export function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loadError, setLoadError] = useState<boolean>(false);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(false);
  };

  const handleLoadError = () => {
    setLoadError(true);
  };

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
        Document unavailable — the PDF could not be loaded.
      </div>
    );
  }

  // Derive the URL for the PDF — files are served from /uploads/
  const pdfSrc = fileUrl.startsWith('http') ? fileUrl : `/uploads/${fileUrl.split('/').pop()}`;

  return (
    <div className="flex h-full flex-col">
      <ReactPdfDocument
        file={pdfSrc}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        className="flex flex-1 flex-col items-center overflow-y-auto"
      >
        <ReactPdfPage
          pageNumber={pageNumber}
          width={500}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </ReactPdfDocument>

      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-white px-4 py-2">
          <button
            type="button"
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className="rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            aria-label="Next page"
            className="rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
