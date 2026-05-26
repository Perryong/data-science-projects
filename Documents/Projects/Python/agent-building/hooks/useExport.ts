'use client';

import { useState, useCallback } from 'react';

export function useExport() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (format: 'CSV' | 'JSON', supplier?: string): Promise<void> => {
    setIsDownloading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ format: format.toLowerCase() });
      if (supplier) params.set('supplier', supplier);

      const res = await fetch(`/api/invoices/export?${params.toString()}`);

      if (!res.ok) {
        let message = 'No approved records match the selected filter.';
        try {
          const body = await res.json() as { error?: string };
          if (body.error) message = body.error;
        } catch {
          // ignore
        }
        setError(message);
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition') ?? '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export.${format.toLowerCase()}`;

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download export. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading, error };
}
