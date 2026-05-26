import React, { useState } from 'react';

interface ApproveButtonProps {
  status: string;
  documentId: number;
  onApproved: () => void;
}

export function ApproveButton({ status, documentId, onApproved }: ApproveButtonProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white">
        ✓ Approved
      </span>
    );
  }

  const canApprove = status === 'EXTRACTED' || status === 'NEEDS_REVIEW';

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${documentId}/approve`, { method: 'POST' });
      if (!res.ok) {
        setError('Failed to approve document. Please try again.');
        return;
      }
      onApproved();
    } catch {
      setError('Failed to approve document. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleApprove}
        disabled={!canApprove || isApproving}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {isApproving ? 'Approving…' : 'Approve'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
