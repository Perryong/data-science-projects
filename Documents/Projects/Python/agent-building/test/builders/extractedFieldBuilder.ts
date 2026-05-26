import { prisma } from '@/lib/prisma';
import { Confidence } from '@prisma/client';

export async function buildExtractedField(overrides: {
  invoiceDocumentId: number;
  fieldName?: string;
  fieldValue?: string;
  confidence?: Confidence;
}) {
  return prisma.extractedField.create({
    data: {
      invoiceDocumentId: overrides.invoiceDocumentId,
      fieldName: overrides.fieldName ?? 'Invoice Number',
      fieldValue: overrides.fieldValue ?? 'INV-001',
      confidence: overrides.confidence ?? 'HIGH',
    },
  });
}
