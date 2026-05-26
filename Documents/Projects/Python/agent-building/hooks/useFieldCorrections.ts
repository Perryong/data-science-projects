'use client';

import { useState, useCallback } from 'react';

export function useFieldCorrections(documentId: number) {
  const [corrections, setCorrections] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = corrections.size > 0;

  const setCorrection = useCallback((fieldName: string, value: string) => {
    setCorrections(prev => {
      const next = new Map(prev);
      next.set(fieldName, value);
      return next;
    });
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (corrections.size === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const correctionsList = Array.from(corrections.entries()).map(([fieldName, correctedValue]) => ({
        fieldName,
        correctedValue,
      }));
      const res = await fetch(`/api/invoices/${documentId}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corrections: correctionsList }),
      });
      if (!res.ok) {
        setSaveError('Failed to save corrections. Please try again.');
        return;
      }
      setCorrections(new Map());
    } catch {
      setSaveError('Failed to save corrections. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [documentId, corrections]);

  return { corrections, setCorrection, isDirty, save, isSaving, saveError };
}
