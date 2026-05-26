import React, { useState } from 'react';

interface ClassificationConfirmModalProps {
  documentId: number;
  supplierCandidates: string[];
  documentTypeCandidates: string[];
  onConfirmed: () => void;
  onDismiss: () => void;
}

const SUPPLIER_LABELS: Record<string, string> = {
  POLYTAINER: 'Polytainer Industries',
  SSS: 'San Soon Seng (SSS)',
  DDW: 'DDW / D.D. Williamson',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  INVOICE: 'Invoice',
  PACK_SLIP: 'Packing Slip',
  COA: 'Certificate of Analysis (COA)',
  DELIVERY_DOCKET: 'Delivery Docket',
};

const ALL_SUPPLIERS = ['POLYTAINER', 'SSS', 'DDW'];
const ALL_DOC_TYPES = ['INVOICE', 'PACK_SLIP', 'COA', 'DELIVERY_DOCKET'];

export function ClassificationConfirmModal({
  documentId,
  supplierCandidates,
  documentTypeCandidates,
  onConfirmed,
  onDismiss,
}: ClassificationConfirmModalProps) {
  const supplierOptions = supplierCandidates.length > 0 ? supplierCandidates : ALL_SUPPLIERS;
  const docTypeOptions = documentTypeCandidates.length > 0 ? documentTypeCandidates : ALL_DOC_TYPES;

  const [selectedSupplier, setSelectedSupplier] = useState(supplierOptions[0] ?? '');
  const [selectedDocType, setSelectedDocType] = useState(docTypeOptions[0] ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedDocType) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${documentId}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierCode: selectedSupplier, documentType: selectedDocType }),
      });
      if (!res.ok) {
        setError('Classification failed. Please try again.');
        return;
      }
      onConfirmed();
    } catch {
      setError('Classification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="classify-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="classify-modal-title" className="text-lg font-semibold text-gray-900">
          Confirm Document Classification
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          We could not automatically classify this document. Please confirm the supplier and document
          type to continue extraction.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Supplier</legend>
            <div className="flex flex-col gap-2">
              {supplierOptions.map((code) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="supplier"
                    value={code}
                    checked={selectedSupplier === code}
                    onChange={() => setSelectedSupplier(code)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {SUPPLIER_LABELS[code] ?? code}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Document Type</legend>
            <div className="flex flex-col gap-2">
              {docTypeOptions.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="docType"
                    value={type}
                    checked={selectedDocType === type}
                    onChange={() => setSelectedDocType(type)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {DOC_TYPE_LABELS[type] ?? type}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onDismiss}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSupplier || !selectedDocType}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Confirming…' : 'Confirm & Extract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
