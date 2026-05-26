import React from 'react';
import type { AnalyticalResult } from '@/hooks/useInvoiceDocument';

interface AnalyticalResultRow {
  id: number;
  testId: string;
  minValue: string | null;
  maxValue: string | null;
  testedValue: string | null;
  rowIndex: number;
}

interface AnalyticalResultsTableProps {
  results: AnalyticalResultRow[];
  onChange: (updated: AnalyticalResultRow[]) => void;
}

export function AnalyticalResultsTable({ results, onChange }: AnalyticalResultsTableProps) {
  const handleCellChange = (rowIndex: number, field: keyof AnalyticalResult, value: string) => {
    const updated = results.map((row, idx) =>
      idx === rowIndex ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  if (results.length === 0) {
    return <p className="text-sm text-gray-500">No analytical results extracted.</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Analytical Results</h3>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Test ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Min Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Max Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Tested Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {results.map((row, idx) => (
              <tr key={row.id}>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={row.testId}
                    onChange={(e) => handleCellChange(idx, 'testId', e.target.value)}
                    aria-label={`Test ID row ${idx + 1}`}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={row.minValue ?? ''}
                    onChange={(e) => handleCellChange(idx, 'minValue', e.target.value)}
                    aria-label={`Min Value row ${idx + 1}`}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={row.maxValue ?? ''}
                    onChange={(e) => handleCellChange(idx, 'maxValue', e.target.value)}
                    aria-label={`Max Value row ${idx + 1}`}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={row.testedValue ?? ''}
                    onChange={(e) => handleCellChange(idx, 'testedValue', e.target.value)}
                    aria-label={`Tested Value row ${idx + 1}`}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
