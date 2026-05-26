import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  EXTRACTING: 'bg-blue-100 text-blue-700',
  EXTRACTED: 'bg-green-100 text-green-700',
  NEEDS_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-700 text-white font-bold',
  FAILED: 'bg-red-100 text-red-700',
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
