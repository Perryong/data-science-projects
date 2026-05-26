import Papa from 'papaparse';
import { prisma } from '@/lib/prisma';
import { SupplierCode, ExportFormat } from '@prisma/client';
import { FIELD_DEFINITIONS } from '@/lib/fieldDefinitions';
import { getApprovedDocuments } from './invoiceService';

type DocumentWithRelations = Awaited<ReturnType<typeof getApprovedDocuments>>[number];

function resolveFieldValue(doc: DocumentWithRelations, fieldName: string): string {
  const field = doc.fields.find(f => f.fieldName === fieldName);
  if (!field) return '';
  return field.isCorrected ? (field.correctedValue ?? '') : (field.fieldValue ?? '');
}

function docToRecord(doc: DocumentWithRelations): Record<string, string> {
  const key = `${doc.supplier?.code}_${doc.documentType}`;
  const fieldNames = FIELD_DEFINITIONS[key] ?? [];
  const record: Record<string, string> = {
    supplier: doc.supplier?.name ?? '',
    documentType: doc.documentType ?? '',
    status: doc.status,
    approvedAt: doc.approvedAt?.toISOString() ?? '',
  };
  for (const fieldName of fieldNames) {
    record[fieldName] = resolveFieldValue(doc, fieldName);
  }
  if (doc.documentType === 'COA') {
    record['analyticalResults'] = JSON.stringify(
      doc.analyticalResults.map(r => ({
        testId: r.testId,
        minValue: r.minValue,
        maxValue: r.maxValue,
        testedValue: r.testedValue,
      }))
    );
  }
  return record;
}

export function serialiseToJson(documents: DocumentWithRelations[]): string {
  return JSON.stringify(documents.map(docToRecord), null, 2);
}

export function serialiseToCsv(documents: DocumentWithRelations[]): string {
  const records = documents.map(docToRecord);
  return Papa.unparse(records);
}

export function buildExportFilename(format: ExportFormat, supplierCode?: SupplierCode): string {
  const supplier = supplierCode ?? 'all';
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = format === 'CSV' ? 'csv' : 'json';
  return `${supplier}_${format}_${ts}.${ext}`;
}

export async function logExport(format: ExportFormat, recordIds: number[]): Promise<void> {
  await prisma.exportLog.create({ data: { format, recordIds } });
}
