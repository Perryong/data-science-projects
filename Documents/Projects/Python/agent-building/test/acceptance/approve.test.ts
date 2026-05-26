/**
 * Acceptance tests: Approval (AC17, AC18)
 *
 * AC17: Approve button changes status to APPROVED.
 * AC18: Approved record stores all field data, supplier, doc type,
 *       PDF ref, confidence, approval timestamp.
 *
 * Both criteria require the database. Tests skipped when DATABASE_URL absent.
 */

export {};

const DATABASE_URL = process.env.DATABASE_URL;
const describeIfDb = DATABASE_URL ? describe : describe.skip;

describeIfDb('AC17 – Approving a document changes status to APPROVED', () => {
  it('approveDocument returns status=APPROVED for a document in EXTRACTED state', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({ status: 'EXTRACTED' });
    const result = await approveDocument(doc.id);

    expect(result.status).toBe('APPROVED');

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });

  it('approveDocument returns status=APPROVED for a document in NEEDS_REVIEW state', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({ status: 'NEEDS_REVIEW' });
    const result = await approveDocument(doc.id);

    expect(result.status).toBe('APPROVED');

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });

  it('approveDocument is rejected (409) for PENDING status', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument, InvalidStatusTransitionError } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({ status: 'PENDING' });

    await expect(approveDocument(doc.id)).rejects.toBeInstanceOf(InvalidStatusTransitionError);

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });

  it('approveDocument is rejected for already-APPROVED status', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument, InvalidStatusTransitionError } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({ status: 'APPROVED' });

    await expect(approveDocument(doc.id)).rejects.toBeInstanceOf(InvalidStatusTransitionError);

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });
});

describeIfDb('AC18 – Approved record stores all required fields', () => {
  it('approved document has approvedAt timestamp set', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({ status: 'EXTRACTED' });
    const result = await approveDocument(doc.id);

    expect(result.approvedAt).not.toBeNull();
    expect(result.approvedAt).toBeInstanceOf(Date);

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });

  it('approved record retains supplier, documentType, fileUrl, and fileHash', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { approveDocument, getDocumentById } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const hash = `approve-hash-${Date.now()}`;
    const doc = await buildInvoiceDocument({
      status: 'EXTRACTED',
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      fileHash: hash,
      fileUrl: `/uploads/${hash}.pdf`,
    });

    await approveDocument(doc.id);
    const full = await getDocumentById(doc.id);

    expect(full.status).toBe('APPROVED');
    expect(full.supplier?.code).toBe('DDW');
    expect(full.documentType).toBe('INVOICE');
    expect(full.fileUrl).toBe(`/uploads/${hash}.pdf`);
    expect(full.fileHash).toBe(hash);
    expect(full.approvedAt).not.toBeNull();

    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });

  it('approved record retains extracted fields and their confidence values', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { buildExtractedField } = await import('@/test/builders/extractedFieldBuilder');
    const { approveDocument, getDocumentById } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const doc = await buildInvoiceDocument({
      status: 'EXTRACTED',
      supplierCode: 'POLYTAINER',
      documentType: 'INVOICE',
      fileHash: `field-hash-${Date.now()}`,
    });

    await buildExtractedField({
      invoiceDocumentId: doc.id,
      fieldName: 'Invoice Number',
      fieldValue: 'PTI99001',
      confidence: 'HIGH',
    });
    await buildExtractedField({
      invoiceDocumentId: doc.id,
      fieldName: 'Invoice Date',
      fieldValue: '2025-01-15',
      confidence: 'MEDIUM',
    });

    await approveDocument(doc.id);
    const full = await getDocumentById(doc.id);

    expect(full.fields.length).toBeGreaterThanOrEqual(2);
    const invNum = full.fields.find(f => f.fieldName === 'Invoice Number');
    expect(invNum?.fieldValue).toBe('PTI99001');
    expect(invNum?.confidence).toBe('HIGH');

    await prisma.extractedField.deleteMany({ where: { invoiceDocumentId: doc.id } });
    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.$disconnect();
  });
});
