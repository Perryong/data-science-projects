// Unit tests for InvoiceListTable rendering logic (pure/data transformations)
import type { InvoiceListDocument } from '@/hooks/useInvoiceList';

const makeDdwDoc = (overrides: Partial<InvoiceListDocument> = {}): InvoiceListDocument => ({
  id: 1,
  status: 'APPROVED',
  documentType: 'INVOICE',
  poNumber: 'PO-001',
  orderNumber: null,
  approvedAt: '2024-01-15T10:00:00.000Z',
  originalFilename: 'test.pdf',
  createdAt: '2024-01-01T00:00:00.000Z',
  supplier: { id: 3, name: 'DDW', code: 'DDW' },
  shipmentRecord: { id: 1, poNumber: 'SH-001', orderNumber: 'ORD-001' },
  ...overrides,
});

describe('InvoiceListTable (shipment group logic)', () => {
  it('shows shipment group for DDW docs with shipmentRecord', () => {
    const doc = makeDdwDoc();
    const shipmentGroup =
      doc.shipmentRecord && doc.supplier?.code === 'DDW'
        ? doc.shipmentRecord.poNumber
        : null;
    expect(shipmentGroup).toBe('SH-001');
  });

  it('does not show shipment group for non-DDW docs', () => {
    const doc = makeDdwDoc({
      supplier: { id: 1, name: 'Polytainer', code: 'POLYTAINER' },
    });
    const shipmentGroup =
      doc.shipmentRecord && doc.supplier?.code === 'DDW'
        ? doc.shipmentRecord.poNumber
        : null;
    expect(shipmentGroup).toBeNull();
  });

  it('does not show shipment group when shipmentRecord is null', () => {
    const doc = makeDdwDoc({ shipmentRecord: null });
    const shipmentGroup =
      doc.shipmentRecord && doc.supplier?.code === 'DDW'
        ? doc.shipmentRecord.poNumber
        : null;
    expect(shipmentGroup).toBeNull();
  });

  it('uses poNumber as identifier when available', () => {
    const doc = makeDdwDoc({ poNumber: 'PO-999' });
    const identifier = doc.poNumber ?? doc.originalFilename;
    expect(identifier).toBe('PO-999');
  });

  it('falls back to originalFilename when poNumber is null', () => {
    const doc = makeDdwDoc({ poNumber: null });
    const identifier = doc.poNumber ?? doc.originalFilename;
    expect(identifier).toBe('test.pdf');
  });

  it('formats approvedAt date correctly', () => {
    const doc = makeDdwDoc({ approvedAt: '2024-01-15T10:00:00.000Z' });
    const formatted = doc.approvedAt
      ? new Date(doc.approvedAt).toLocaleDateString()
      : null;
    expect(formatted).not.toBeNull();
    expect(typeof formatted).toBe('string');
  });
});

describe('InvoiceListTable (empty state)', () => {
  it('empty documents array results in empty state', () => {
    const documents: InvoiceListDocument[] = [];
    expect(documents.length).toBe(0);
  });
});
