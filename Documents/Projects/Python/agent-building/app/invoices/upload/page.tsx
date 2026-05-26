'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUpload } from '@/hooks/useUpload';
import { FileDropzone } from '@/components/invoices/FileDropzone';
import { UploadProgressItem } from '@/components/invoices/UploadProgressItem';
import { DuplicateWarningModal } from '@/components/invoices/DuplicateWarningModal';

interface DuplicateItem {
  filename: string;
  existingDocumentId: number;
}

export default function UploadPage() {
  const { files, upload } = useUpload();
  const router = useRouter();
  const [dismissedDuplicates, setDismissedDuplicates] = useState<Set<string>>(new Set());

  const handleFilesSelected = (newFiles: File[]) => {
    upload(newFiles);
  };

  const hasSuccessful = files.some((f) => f.state === 'success');
  const hasExtracting = files.some((f) => f.state === 'success');

  // Collect duplicates that haven't been dismissed
  const pendingDuplicates: DuplicateItem[] = files
    .filter(
      (f) =>
        f.state === 'duplicate' &&
        f.documentId !== undefined &&
        !dismissedDuplicates.has(f.file.name)
    )
    .map((f) => ({ filename: f.file.name, existingDocumentId: f.documentId! }));

  const currentDuplicate = pendingDuplicates[0] ?? null;

  const handleDuplicateProceed = (documentId: number) => {
    router.push(`/invoices/${documentId}/review`);
  };

  const handleDuplicateDismiss = () => {
    if (currentDuplicate) {
      setDismissedDuplicates((prev) => {
        const next = new Set(prev);
        next.add(currentDuplicate.filename);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/invoices" className="text-sm text-blue-600 hover:underline">
          ← Back to Invoices
        </Link>
      </div>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">Upload Documents</h1>

      <FileDropzone onFilesSelected={handleFilesSelected} />

      {files.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {files.map((f, i) => (
            <UploadProgressItem
              key={`${f.file.name}-${i}`}
              filename={f.file.name}
              size={f.file.size}
              progress={f.progress}
              state={f.state}
              errorMessage={f.errorMessage}
              documentId={f.documentId}
            />
          ))}
        </div>
      )}

      {hasSuccessful && hasExtracting && (
        <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Extraction in progress — you can check status on the{' '}
          <Link href="/invoices" className="underline">
            invoices list
          </Link>
          .
        </div>
      )}

      {currentDuplicate && (
        <DuplicateWarningModal
          filename={currentDuplicate.filename}
          existingDocumentId={currentDuplicate.existingDocumentId}
          onProceed={handleDuplicateProceed}
          onCancel={handleDuplicateDismiss}
        />
      )}
    </div>
  );
}
