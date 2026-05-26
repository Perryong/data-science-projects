'use client';

import React, { useState } from 'react';
import { useExport } from '@/hooks/useExport';

export function ExportForm() {
  const [supplier, setSupplier] = useState('');
  const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');
  const { download, isDownloading, error } = useExport();

  const handleDownload = async () => {
    await download(format, supplier || undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="export-supplier" className="text-sm font-medium text-gray-700">
          Supplier Filter
        </label>
        <select
          id="export-supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          className="w-full max-w-xs rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Suppliers</option>
          <option value="POLYTAINER">POLYTAINER</option>
          <option value="SSS">SSS</option>
          <option value="DDW">DDW</option>
        </select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Export Format</legend>
        <div className="flex gap-4">
          {(['CSV', 'JSON'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="export-format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{f}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-fit rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isDownloading ? 'Downloading…' : 'Download'}
      </button>
    </div>
  );
}
