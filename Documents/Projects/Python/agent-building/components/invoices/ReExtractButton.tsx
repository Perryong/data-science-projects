import React, { useState } from 'react';

interface ReExtractButtonProps {
  documentId: number;
  onReExtracted: () => void;
}

export function ReExtractButton({ documentId, onReExtracted }: ReExtractButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${documentId}/extract`, { method: 'POST' });
      if (!res.ok) {
        setError('Failed to start re-extraction. Please try again.');
        return;
      }
      setShowConfirm(false);
      onReExtracted();
    } catch {
      setError('Failed to start re-extraction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Re-Extract
      </button>

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="re-extract-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 id="re-extract-dialog-title" className="text-base font-semibold text-gray-900">
              Re-Extract Document?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This will discard all corrections and re-run extraction. Continue?
            </p>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowConfirm(false); setError(null); }}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {isSubmitting ? 'Starting…' : 'Yes, Re-Extract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
