import React from 'react';
import Link from 'next/link';
import type { InvoiceListDocument } from '@/hooks/useInvoiceList';
import { StatusChip } from './StatusChip';

interface InvoiceListTableProps {
  documents: InvoiceListDocument[];
}

export function InvoiceListTable({ documents }: InvoiceListTableProps) {
  if (documents.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        No invoices uploaded yet. Upload one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Supplier</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Document Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">PO Number</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Shipment Group</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Approved At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {documents.map((doc) => {
            const shipmentGroup =
              doc.shipmentRecord && doc.supplier?.code === 'DDW'
                ? doc.shipmentRecord.poNumber
                : null;

            return (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {doc.supplier?.name ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  {doc.documentType
                    ? doc.documentType.replace(/_/g, ' ')
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/invoices/${doc.id}/review`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {doc.poNumber ?? doc.originalFilename}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {shipmentGroup ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={doc.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {doc.approvedAt
                    ? new Date(doc.approvedAt).toLocaleDateString()
                    : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
