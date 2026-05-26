import { prisma } from '@/lib/prisma';
import { SupplierCode, InvoiceDocument } from '@prisma/client';

export class InvoiceNotFoundError extends Error {}
export class InvalidStatusTransitionError extends Error {}

const documentInclude = {
  supplier: true,
  shipmentRecord: true,
  fields: true,
  analyticalResults: { orderBy: { rowIndex: 'asc' as const } },
};

export async function getDocumentById(id: number) {
  const doc = await prisma.invoiceDocument.findUnique({ where: { id }, include: documentInclude });
  if (!doc) throw new InvoiceNotFoundError(`Document ${id} not found`);
  return doc;
}

export async function listDocuments(filter: { supplierCode?: SupplierCode }) {
  const where = filter.supplierCode
    ? { supplier: { code: filter.supplierCode } }
    : {};
  return prisma.invoiceDocument.findMany({
    where,
    include: { supplier: true, shipmentRecord: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateFieldCorrections(
  documentId: number,
  corrections: Array<{ fieldName: string; correctedValue: string }>
) {
  const doc = await prisma.invoiceDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new InvoiceNotFoundError(`Document ${documentId} not found`);

  let count = 0;
  for (const { fieldName, correctedValue } of corrections) {
    const result = await prisma.extractedField.updateMany({
      where: { invoiceDocumentId: documentId, fieldName },
      data: { correctedValue, isCorrected: true },
    });
    count += result.count;
  }
  return count;
}

export async function approveDocument(documentId: number): Promise<InvoiceDocument> {
  const doc = await prisma.invoiceDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new InvoiceNotFoundError(`Document ${documentId} not found`);
  if (!['EXTRACTED', 'NEEDS_REVIEW'].includes(doc.status)) {
    throw new InvalidStatusTransitionError(`Cannot approve document with status ${doc.status}`);
  }
  return prisma.invoiceDocument.update({
    where: { id: documentId },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });
}

export async function updateAnalyticalResults(
  documentId: number,
  results: Array<{ testId: string; minValue?: string | null; maxValue?: string | null; testedValue?: string | null; rowIndex: number }>
): Promise<void> {
  const doc = await prisma.invoiceDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new InvoiceNotFoundError(`Document ${documentId} not found`);
  await prisma.$transaction(async (tx) => {
    await tx.analyticalResult.deleteMany({ where: { invoiceDocumentId: documentId } });
    if (results.length > 0) {
      await tx.analyticalResult.createMany({
        data: results.map(r => ({ invoiceDocumentId: documentId, ...r })),
      });
    }
  });
}

export async function getApprovedDocuments(filter: { supplierCode?: SupplierCode }) {
  const where: Record<string, unknown> = { status: 'APPROVED' };
  if (filter.supplierCode) where['supplier'] = { code: filter.supplierCode };
  return prisma.invoiceDocument.findMany({ where, include: documentInclude, orderBy: { approvedAt: 'desc' } });
}
