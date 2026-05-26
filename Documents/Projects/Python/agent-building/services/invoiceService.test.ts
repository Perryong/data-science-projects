// Integration tests — require DATABASE_URL to be set
const DATABASE_URL = process.env.DATABASE_URL;
const describeIfDb = DATABASE_URL ? describe : describe.skip;

import { buildInvoiceDocument } from '@/test/builders/invoiceDocumentBuilder';
import {
  approveDocument,
  updateFieldCorrections,
  listDocuments,
  getDocumentById,
  InvoiceNotFoundError,
  InvalidStatusTransitionError,
} from './invoiceService';
import { buildExtractedField } from '@/test/builders/extractedFieldBuilder';
import { prisma } from '@/lib/prisma';

afterAll(() => prisma.$disconnect());

describeIfDb('approveDocument', () => {
  it('sets status to APPROVED and sets approvedAt', async () => {
    const doc = await buildInvoiceDocument({ status: 'EXTRACTED' });
    const approved = await approveDocument(doc.id);
    expect(approved.status).toBe('APPROVED');
    expect(approved.approvedAt).not.toBeNull();
  });
  it('throws InvalidStatusTransitionError if status is PENDING', async () => {
    const doc = await buildInvoiceDocument({ status: 'PENDING' });
    await expect(approveDocument(doc.id)).rejects.toBeInstanceOf(InvalidStatusTransitionError);
  });
  it('throws if status is already APPROVED', async () => {
    const doc = await buildInvoiceDocument({ status: 'APPROVED' });
    await expect(approveDocument(doc.id)).rejects.toBeInstanceOf(InvalidStatusTransitionError);
  });
});

describeIfDb('updateFieldCorrections', () => {
  it('sets correctedValue and isCorrected=true', async () => {
    const doc = await buildInvoiceDocument({ status: 'EXTRACTED' });
    await buildExtractedField({ invoiceDocumentId: doc.id, fieldName: 'Invoice Number', fieldValue: 'OLD' });
    await updateFieldCorrections(doc.id, [{ fieldName: 'Invoice Number', correctedValue: 'NEW' }]);
    const field = await prisma.extractedField.findFirst({
      where: { invoiceDocumentId: doc.id, fieldName: 'Invoice Number' },
    });
    expect(field?.correctedValue).toBe('NEW');
    expect(field?.isCorrected).toBe(true);
  });
  it('throws InvoiceNotFoundError for unknown document', async () => {
    await expect(
      updateFieldCorrections(999999, [{ fieldName: 'Invoice Number', correctedValue: 'X' }])
    ).rejects.toBeInstanceOf(InvoiceNotFoundError);
  });
});

describeIfDb('listDocuments', () => {
  it('filters by supplierCode', async () => {
    await buildInvoiceDocument({ supplierCode: 'POLYTAINER' });
    const results = await listDocuments({ supplierCode: 'POLYTAINER' });
    expect(results.every(d => d.supplier?.code === 'POLYTAINER')).toBe(true);
  });
  it('returns all documents when no filter provided', async () => {
    const results = await listDocuments({});
    expect(Array.isArray(results)).toBe(true);
  });
});

describeIfDb('getDocumentById', () => {
  it('returns document with relations', async () => {
    const doc = await buildInvoiceDocument({ status: 'EXTRACTED' });
    const fetched = await getDocumentById(doc.id);
    expect(fetched.id).toBe(doc.id);
    expect(fetched.fields).toBeDefined();
    expect(fetched.analyticalResults).toBeDefined();
  });
  it('throws InvoiceNotFoundError for unknown id', async () => {
    await expect(getDocumentById(999999)).rejects.toBeInstanceOf(InvoiceNotFoundError);
  });
});
