'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ExtractedField {
  id: number;
  fieldName: string;
  fieldValue: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  correctedValue: string | null;
  isCorrected: boolean;
}

export interface AnalyticalResult {
  id: number;
  testId: string;
  minValue: string | null;
  maxValue: string | null;
  testedValue: string | null;
  rowIndex: number;
}

export interface InvoiceDocument {
  id: number;
  status: string;
  documentType: string | null;
  poNumber: string | null;
  orderNumber: string | null;
  approvedAt: string | null;
  extractedAt: string | null;
  extractionError: string | null;
  originalFilename: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  supplier: { id: number; name: string; code: string } | null;
  shipmentRecord: { id: number; poNumber: string; orderNumber: string } | null;
  fields: ExtractedField[];
  analyticalResults: AnalyticalResult[];
}

export function useInvoiceDocument(id: number) {
  const [document, setDocument] = useState<InvoiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.status === 404) {
        setError('Document not found.');
        return;
      }
      if (!res.ok) {
        setError('Failed to load document. Please try again.');
        return;
      }
      const data = await res.json() as { document: InvoiceDocument };
      setDocument(data.document);
    } catch {
      setError('Failed to load document. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDocument();
  }, [fetchDocument]);

  return { document, loading, error, refetch: fetchDocument };
}
