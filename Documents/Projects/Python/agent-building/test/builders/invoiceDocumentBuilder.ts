import { prisma } from '@/lib/prisma';
import { DocumentStatus, DocumentType, SupplierCode } from '@prisma/client';
import { buildSupplier } from './supplierBuilder';

export async function buildInvoiceDocument(
  overrides: Partial<{
    status: DocumentStatus;
    documentType: DocumentType;
    supplierCode: SupplierCode;
    poNumber: string;
    orderNumber: string;
    fileUrl: string;
    fileHash: string;
    originalFilename: string;
  }> = {}
) {
  const supplier = await buildSupplier({ code: overrides.supplierCode ?? 'POLYTAINER' });
  return prisma.invoiceDocument.create({
    data: {
      supplierId: supplier.id,
      status: overrides.status ?? 'PENDING',
      documentType: overrides.documentType ?? 'INVOICE',
      poNumber: overrides.poNumber ?? 'PO-TEST-001',
      orderNumber: overrides.orderNumber,
      fileUrl: overrides.fileUrl ?? '/uploads/testhash.pdf',
      fileHash: overrides.fileHash ?? `hash-${Date.now()}-${Math.random()}`,
      originalFilename: overrides.originalFilename ?? 'test.pdf',
    },
  });
}
