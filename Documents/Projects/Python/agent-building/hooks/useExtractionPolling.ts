'use client';

import { useEffect, useRef } from 'react';
import type { InvoiceDocument } from './useInvoiceDocument';

const TERMINAL_STATUSES = ['EXTRACTED', 'FAILED', 'APPROVED', 'NEEDS_REVIEW'];
const POLL_INTERVAL_MS = 3000;

export function useExtractionPolling(
  documentId: number,
  currentStatus: string | undefined,
  onComplete: (doc: InvoiceDocument) => void
) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!currentStatus || TERMINAL_STATUSES.includes(currentStatus)) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoices/${documentId}`);
        if (!res.ok) return;
        const data = await res.json() as { document: InvoiceDocument };
        const doc = data.document;
        if (TERMINAL_STATUSES.includes(doc.status)) {
          clearInterval(intervalId);
          onCompleteRef.current(doc);
        }
      } catch {
        // silently ignore poll failures
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [documentId, currentStatus]);
}
