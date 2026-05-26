import React, { useState } from 'react';
import { FIELD_DEFINITIONS } from '@/lib/fieldDefinitions';
import type { InvoiceDocument } from '@/hooks/useInvoiceDocument';
import { useFieldCorrections } from '@/hooks/useFieldCorrections';
import { FieldInput } from './FieldInput';
import { AnalyticalResultsTable } from './AnalyticalResultsTable';

interface AnalyticalResultRow {
  id: number;
  testId: string;
  minValue: string | null;
  maxValue: string | null;
  testedValue: string | null;
  rowIndex: number;
}

interface ExtractedFieldsFormProps {
  document: InvoiceDocument;
}

export function ExtractedFieldsForm({ document }: ExtractedFieldsFormProps) {
  const { corrections, setCorrection, isDirty, save, isSaving, saveError } = useFieldCorrections(document.id);
  const [analyticalResults, setAnalyticalResults] = useState<AnalyticalResultRow[]>(document.analyticalResults);
  const [analyticalDirty, setAnalyticalDirty] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [analyticalSaveError, setAnalyticalSaveError] = useState<string | null>(null);

  const supplierCode = document.supplier?.code;
  const docType = document.documentType;
  const definitionKey = supplierCode && docType ? `${supplierCode}_${docType}` : null;
  const fieldNames = definitionKey ? (FIELD_DEFINITIONS[definitionKey] ?? []) : [];

  const isDdwCoa =
    document.supplier?.code === 'DDW' && document.documentType === 'COA';

  const handleAnalyticalChange = (updated: AnalyticalResultRow[]) => {
    setAnalyticalResults(updated);
    setAnalyticalDirty(true);
  };

  const isAnythingDirty = isDirty || analyticalDirty;

  const handleSave = async () => {
    setSavedMessage(null);
    setAnalyticalSaveError(null);

    if (isDirty) {
      await save();
    }

    if (analyticalDirty) {
      try {
        const res = await fetch(`/api/invoices/${document.id}/fields`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analyticalResults: analyticalResults.map((r, idx) => ({
              testId: r.testId,
              minValue: r.minValue,
              maxValue: r.maxValue,
              testedValue: r.testedValue,
              rowIndex: idx,
            })),
          }),
        });
        if (!res.ok) {
          setAnalyticalSaveError('Failed to save analytical results. Please try again.');
          return;
        }
        setAnalyticalDirty(false);
      } catch {
        setAnalyticalSaveError('Failed to save analytical results. Please try again.');
        return;
      }
    }

    setSavedMessage('Corrections saved.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Extracted Fields</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isAnythingDirty || isSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isSaving ? 'Saving…' : 'Save Corrections'}
        </button>
      </div>

      {(saveError || analyticalSaveError) && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveError ?? analyticalSaveError}
        </div>
      )}

      {savedMessage && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {savedMessage}
        </div>
      )}

      {fieldNames.length === 0 && (
        <p className="text-sm text-gray-500">
          No field definitions available for this document type.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {fieldNames.map((fieldName) => {
          const field = document.fields.find((f) => f.fieldName === fieldName);
          const correctedValue = corrections.get(fieldName) ?? field?.correctedValue ?? null;
          const isCorrected =
            corrections.has(fieldName) || (field?.isCorrected ?? false);

          return (
            <FieldInput
              key={fieldName}
              fieldName={fieldName}
              fieldValue={field?.fieldValue ?? null}
              correctedValue={correctedValue}
              confidence={field?.confidence ?? 'LOW'}
              isCorrected={isCorrected}
              onChange={(value) => setCorrection(fieldName, value)}
            />
          );
        })}
      </div>

      {isDdwCoa && (
        <AnalyticalResultsTable
          results={analyticalResults}
          onChange={handleAnalyticalChange}
        />
      )}
    </div>
  );
}
