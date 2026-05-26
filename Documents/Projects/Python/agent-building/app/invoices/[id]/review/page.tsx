'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInvoiceDocument } from '@/hooks/useInvoiceDocument';
import type { InvoiceDocument } from '@/hooks/useInvoiceDocument';
import { ReviewLayout } from '@/components/invoices/ReviewLayout';
import { PdfViewer } from '@/components/invoices/PdfViewer';
import { ExtractionStatusBanner } from '@/components/invoices/ExtractionStatusBanner';
import { ExtractedFieldsForm } from '@/components/invoices/ExtractedFieldsForm';
import { ClassificationConfirmModal } from '@/components/invoices/ClassificationConfirmModal';
import { ApproveButton } from '@/components/invoices/ApproveButton';
import { ReExtractButton } from '@/components/invoices/ReExtractButton';
import { StatusChip } from '@/components/invoices/StatusChip';
import { UnsavedChangesGuard } from '@/components/invoices/UnsavedChangesGuard';

// needsUserConfirmation is embedded in the document when status === NEEDS_REVIEW
// and there are no supplier/documentType set. We surface the modal and read
// candidate info from the document.

export default function ReviewPage() {
  const params = useParams();
  const documentId = parseInt(params.id as string, 10);

  const { document, loading, error, refetch } = useInvoiceDocument(documentId);
  const [localDocument, setLocalDocument] = useState<InvoiceDocument | null>(null);
  const [showClassifyModal, setShowClassifyModal] = useState(false);
  const [classifyDismissed, setClassifyDismissed] = useState(false);

  const effectiveDocument = localDocument ?? document;

  const handleExtractionComplete = useCallback((updatedDoc: InvoiceDocument) => {
    setLocalDocument(updatedDoc);
  }, []);

  const handleApproved = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleReExtracted = useCallback(() => {
    setLocalDocument(null);
    void refetch();
  }, [refetch]);

  const handleClassifyConfirmed = useCallback(() => {
    setShowClassifyModal(false);
    setLocalDocument(null);
    void refetch();
  }, [refetch]);

  const handleClassifyDismiss = useCallback(() => {
    setClassifyDismissed(true);
    setShowClassifyModal(false);
  }, []);

  // Show classification modal when status is NEEDS_REVIEW and user hasn't dismissed
  const shouldShowClassifyModal =
    effectiveDocument?.status === 'NEEDS_REVIEW' &&
    !classifyDismissed &&
    !showClassifyModal;

  React.useEffect(() => {
    if (shouldShowClassifyModal) {
      setShowClassifyModal(true);
    }
  }, [shouldShowClassifyModal]);

  if (loading && !effectiveDocument) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">Loading document…</div>
    );
  }

  if (error && !effectiveDocument) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/invoices" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  if (!effectiveDocument) return null;

  const identifier =
    effectiveDocument.poNumber ?? effectiveDocument.orderNumber ?? effectiveDocument.originalFilename;

  const isExtracted =
    effectiveDocument.status === 'EXTRACTED' || effectiveDocument.status === 'APPROVED';

  return (
    <div className="flex flex-col gap-4">
      <UnsavedChangesGuard isDirty={false} />

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/invoices" className="text-sm text-blue-600 hover:underline">
          ← Back to Invoices
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">{identifier}</span>
            <span className="text-xs text-gray-500">
              {effectiveDocument.supplier?.name ?? 'Unknown supplier'}
              {effectiveDocument.documentType && ` · ${effectiveDocument.documentType.replace(/_/g, ' ')}`}
            </span>
          </div>
          <StatusChip status={effectiveDocument.status} />
          <ReExtractButton documentId={documentId} onReExtracted={handleReExtracted} />
          <ApproveButton
            status={effectiveDocument.status}
            documentId={documentId}
            onApproved={handleApproved}
          />
        </div>
      </div>

      {/* Extraction status banner */}
      {(effectiveDocument.status === 'PENDING' || effectiveDocument.status === 'EXTRACTING') && (
        <ExtractionStatusBanner
          documentId={documentId}
          status={effectiveDocument.status}
          onComplete={handleExtractionComplete}
        />
      )}

      {/* Extraction error */}
      {effectiveDocument.status === 'FAILED' && effectiveDocument.extractionError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Extraction failed. You can try re-extracting.
        </div>
      )}

      {/* Side by side layout */}
      <ReviewLayout
        left={<PdfViewer fileUrl={effectiveDocument.fileUrl} />}
        right={
          isExtracted ? (
            <ExtractedFieldsForm document={effectiveDocument} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
              {effectiveDocument.status === 'PENDING' || effectiveDocument.status === 'EXTRACTING'
                ? 'Waiting for extraction to complete…'
                : effectiveDocument.status === 'FAILED'
                ? 'Extraction failed. Use Re-Extract to try again.'
                : 'No extracted data available yet.'}
            </div>
          )
        }
      />

      {/* Classification modal */}
      {showClassifyModal && (
        <ClassificationConfirmModal
          documentId={documentId}
          supplierCandidates={
            effectiveDocument.supplier
              ? [effectiveDocument.supplier.code]
              : []
          }
          documentTypeCandidates={
            effectiveDocument.documentType ? [effectiveDocument.documentType] : []
          }
          onConfirmed={handleClassifyConfirmed}
          onDismiss={handleClassifyDismiss}
        />
      )}
    </div>
  );
}
