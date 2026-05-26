import React from 'react';

interface DuplicateWarningModalProps {
  filename: string;
  existingDocumentId: number;
  onProceed: (documentId: number) => void;
  onCancel: () => void;
}

export function DuplicateWarningModal({
  filename,
  existingDocumentId,
  onProceed,
  onCancel,
}: DuplicateWarningModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="duplicate-modal-title" className="text-lg font-semibold text-gray-900">
          Duplicate File Detected
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{filename}</span> has already been uploaded. An identical
          document already exists in the system.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => onProceed(existingDocumentId)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Existing Document
          </button>
        </div>
      </div>
    </div>
  );
}
