/**
 * Acceptance tests: Shipment Linking (AC11, EC3, EC4)
 *
 * AC11: DDW docs with same PO + Order Number linked as one shipment record.
 * EC3:  DDW partial shipment — each doc approved independently.
 * EC4:  DDW same PO, different Order Number → separate shipment records.
 *
 * resolveShipmentLink uses the database; all tests skipped when DATABASE_URL absent.
 */

export {};

const DATABASE_URL = process.env.DATABASE_URL;
const describeIfDb = DATABASE_URL ? describe : describe.skip;

describeIfDb('AC11 – DDW docs with same PO + Order Number share one shipment record', () => {
  it('two DDW docs with identical PO and Order Number point to the same ShipmentRecord', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { resolveShipmentLink } = await import('@/services/extractionService');
    const { prisma } = await import('@/lib/prisma');

    const po = `PO-SHARED-${Date.now()}`;
    const order = `ORD-SHARED-${Date.now()}`;

    const doc1 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      poNumber: po,
      orderNumber: order,
      fileHash: `hash-doc1-${Date.now()}`,
    });
    const doc2 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'PACK_SLIP',
      poNumber: po,
      orderNumber: order,
      fileHash: `hash-doc2-${Date.now()}`,
    });

    await resolveShipmentLink(doc1.id);
    await resolveShipmentLink(doc2.id);

    const updated1 = await prisma.invoiceDocument.findUnique({ where: { id: doc1.id } });
    const updated2 = await prisma.invoiceDocument.findUnique({ where: { id: doc2.id } });

    expect(updated1?.shipmentRecordId).not.toBeNull();
    expect(updated2?.shipmentRecordId).not.toBeNull();
    expect(updated1?.shipmentRecordId).toBe(updated2?.shipmentRecordId);

    // Cleanup
    await prisma.invoiceDocument.deleteMany({ where: { id: { in: [doc1.id, doc2.id] } } });
    if (updated1?.shipmentRecordId) {
      await prisma.shipmentRecord.delete({ where: { id: updated1.shipmentRecordId } });
    }
    await prisma.$disconnect();
  });
});

describeIfDb('EC4 – Same PO, different Order Number → separate shipment records', () => {
  it('two DDW docs with same PO but different Order Number get distinct ShipmentRecords', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { resolveShipmentLink } = await import('@/services/extractionService');
    const { prisma } = await import('@/lib/prisma');

    const po = `PO-DIFF-${Date.now()}`;
    const order1 = `ORD-A-${Date.now()}`;
    const order2 = `ORD-B-${Date.now()}`;

    const doc1 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      poNumber: po,
      orderNumber: order1,
      fileHash: `hash-sep1-${Date.now()}`,
    });
    const doc2 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      poNumber: po,
      orderNumber: order2,
      fileHash: `hash-sep2-${Date.now()}`,
    });

    await resolveShipmentLink(doc1.id);
    await resolveShipmentLink(doc2.id);

    const updated1 = await prisma.invoiceDocument.findUnique({ where: { id: doc1.id } });
    const updated2 = await prisma.invoiceDocument.findUnique({ where: { id: doc2.id } });

    expect(updated1?.shipmentRecordId).not.toBeNull();
    expect(updated2?.shipmentRecordId).not.toBeNull();
    // Different order numbers → different shipment records
    expect(updated1?.shipmentRecordId).not.toBe(updated2?.shipmentRecordId);

    // Cleanup
    await prisma.invoiceDocument.deleteMany({ where: { id: { in: [doc1.id, doc2.id] } } });
    const ids = [updated1?.shipmentRecordId, updated2?.shipmentRecordId].filter((id): id is number => id !== null && id !== undefined);
    if (ids.length > 0) {
      await prisma.shipmentRecord.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.$disconnect();
  });
});

describeIfDb('EC3 – DDW partial shipment: each doc approved independently', () => {
  it('approving one DDW doc from a shared shipment does not change status of sibling doc', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { resolveShipmentLink } = await import('@/services/extractionService');
    const { approveDocument } = await import('@/services/invoiceService');
    const { prisma } = await import('@/lib/prisma');

    const po = `PO-PARTIAL-${Date.now()}`;
    const order = `ORD-PARTIAL-${Date.now()}`;

    const doc1 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      status: 'EXTRACTED',
      poNumber: po,
      orderNumber: order,
      fileHash: `hash-partial1-${Date.now()}`,
    });
    const doc2 = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'PACK_SLIP',
      status: 'EXTRACTED',
      poNumber: po,
      orderNumber: order,
      fileHash: `hash-partial2-${Date.now()}`,
    });

    await resolveShipmentLink(doc1.id);
    await resolveShipmentLink(doc2.id);

    // Approve only the first doc
    const approved = await approveDocument(doc1.id);
    expect(approved.status).toBe('APPROVED');

    // Sibling doc remains EXTRACTED (not auto-approved)
    const sibling = await prisma.invoiceDocument.findUnique({ where: { id: doc2.id } });
    expect(sibling?.status).toBe('EXTRACTED');

    // Cleanup
    await prisma.invoiceDocument.deleteMany({ where: { id: { in: [doc1.id, doc2.id] } } });
    const updated1 = await prisma.invoiceDocument.findUnique({ where: { id: doc1.id } });
    if (!updated1) {
      // already deleted
      const shipment = await prisma.shipmentRecord.findFirst({
        where: { poNumber: po, orderNumber: order },
      });
      if (shipment) await prisma.shipmentRecord.delete({ where: { id: shipment.id } });
    }
    await prisma.$disconnect();
  });
});

describeIfDb('AC11 – resolveShipmentLink is idempotent for same PO/Order', () => {
  it('calling resolveShipmentLink twice for same doc does not create duplicate shipment records', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { resolveShipmentLink } = await import('@/services/extractionService');
    const { prisma } = await import('@/lib/prisma');

    const po = `PO-IDEM-${Date.now()}`;
    const order = `ORD-IDEM-${Date.now()}`;

    const doc = await buildInvoiceDocument({
      supplierCode: 'DDW',
      documentType: 'INVOICE',
      poNumber: po,
      orderNumber: order,
      fileHash: `hash-idem-${Date.now()}`,
    });

    await resolveShipmentLink(doc.id);
    await resolveShipmentLink(doc.id); // second call — should upsert, not duplicate

    const shipments = await prisma.shipmentRecord.findMany({
      where: { poNumber: po, orderNumber: order },
    });
    expect(shipments).toHaveLength(1);

    // Cleanup
    await prisma.invoiceDocument.delete({ where: { id: doc.id } });
    await prisma.shipmentRecord.delete({ where: { id: shipments[0].id } });
    await prisma.$disconnect();
  });
});
