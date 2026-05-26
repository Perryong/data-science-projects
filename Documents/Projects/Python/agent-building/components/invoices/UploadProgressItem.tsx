import React from 'react';
import Link from 'next/link';
import type { UploadFileState } from '@/hooks/useUpload';

interface UploadProgressItemProps {
  filename: string;
  size: number;
  progress: number;
  state: UploadFileState;
  errorMessage?: string;
  documentId?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadProgressItem({
  filename,
  size,
  progress,
  state,
  errorMessage,
  documentId,
}: UploadProgressItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">{filename}</p>
          <p className="text-xs text-gray-500">{formatBytes(size)}</p>
        </div>
        <div className="flex-shrink-0">
          {state === 'uploading' && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading…
            </span>
          )}
          {state === 'success' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              ✓ Uploaded
            </span>
          )}
          {state === 'error' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              ✗ Failed
            </span>
          )}
          {state === 'duplicate' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              Duplicate
            </span>
          )}
          {state === 'pending' && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              Pending
            </span>
          )}
        </div>
      </div>

      {(state === 'uploading') && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Upload progress for ${filename}`}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
        </div>
      )}

      {state === 'error' && errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}

      {state === 'success' && documentId !== undefined && (
        <p className="mt-1 text-xs">
          <Link href={`/invoices/${documentId}/review`} className="text-blue-600 hover:underline">
            View document
          </Link>
        </p>
      )}
    </div>
  );
}
