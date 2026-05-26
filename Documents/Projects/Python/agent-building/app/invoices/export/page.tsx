import React from 'react';
import Link from 'next/link';
import { ExportForm } from '@/components/invoices/ExportForm';

export default function ExportPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/invoices" className="text-sm text-blue-600 hover:underline">
          ← Back to Invoices
        </Link>
      </div>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">Export Approved Data</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ExportForm />
      </div>
    </div>
  );
}
