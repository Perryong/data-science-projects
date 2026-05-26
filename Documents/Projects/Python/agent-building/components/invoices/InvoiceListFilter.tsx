import React from 'react';

interface InvoiceListFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function InvoiceListFilter({ value, onChange }: InvoiceListFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="supplier-filter" className="text-sm font-medium text-gray-700">
        Supplier
      </label>
      <select
        id="supplier-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All</option>
        <option value="POLYTAINER">POLYTAINER</option>
        <option value="SSS">SSS</option>
        <option value="DDW">DDW</option>
      </select>
    </div>
  );
}
