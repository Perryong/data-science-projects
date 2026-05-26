'use client';

import { useState, useEffect, useCallback } from 'react';

export interface InvoiceListDocument {
  id: number;
  status: string;
  documentType: string | null;
  poNumber: string | null;
  orderNumber: string | null;
  approvedAt: string | null;
  originalFilename: string;
  createdAt: string;
  supplier: { id: number; name: string; code: string } | null;
  shipmentRecord: { id: number; poNumber: string; orderNumber: string } | null;
}

export function useInvoiceList(initialSupplierFilter?: string) {
  const [documents, setDocuments] = useState<InvoiceListDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState(initialSupplierFilter ?? '');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = supplierFilter
        ? `/api/invoices?supplier=${encodeURIComponent(supplierFilter)}`
        : '/api/invoices';
      const res = await fetch(url);
      if (!res.ok) {
        setError('Failed to load invoices. Please try again.');
        return;
      }
      const data = await res.json() as { documents: InvoiceListDocument[] };
      setDocuments(data.documents);
    } catch {
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [supplierFilter]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, setSupplierFilter, refetch: fetchDocuments };
}
