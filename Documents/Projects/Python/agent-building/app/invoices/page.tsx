'use client';

import React from 'react';
import Link from 'next/link';
import { useInvoiceList } from '@/hooks/useInvoiceList';
import { InvoiceListTable } from '@/components/invoices/InvoiceListTable';
import { InvoiceListFilter } from '@/components/invoices/InvoiceListFilter';

export default function InvoicesPage() {
  const { documents, loading, error, setSupplierFilter } = useInvoiceList();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
        <Link
          href="/invoices/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Upload
        </Link>
      </div>

      <div className="mb-4">
        <InvoiceListFilter value="" onChange={setSupplierFilter} />
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-gray-500">Loading invoices…</div>
      )}

      {error && !loading && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <InvoiceListTable documents={documents} />
      )}
    </div>
  );
}
