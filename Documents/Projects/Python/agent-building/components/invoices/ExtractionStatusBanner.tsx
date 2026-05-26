import React from 'react';
import { useExtractionPolling } from '@/hooks/useExtractionPolling';
import type { InvoiceDocument } from '@/hooks/useInvoiceDocument';

interface ExtractionStatusBannerProps {
  documentId: number;
  status: string;
  onComplete: (doc: InvoiceDocument) => void;
}

export function ExtractionStatusBanner({ documentId, status, onComplete }: ExtractionStatusBannerProps) {
  useExtractionPolling(documentId, status, onComplete);

  const isActive = status === 'PENDING' || status === 'EXTRACTING';
  if (!isActive) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700"
    >
      <svg
        className="h-4 w-4 animate-spin flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span>
        {status === 'EXTRACTING' ? 'Extracting data from document…' : 'Extraction queued — waiting to start…'}
      </span>
    </div>
  );
}
