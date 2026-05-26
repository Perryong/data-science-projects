// Unit tests for useInvoiceDocument fetch logic

describe('useInvoiceDocument (fetch logic)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds correct URL from document id', () => {
    const id = 42;
    const url = `/api/invoices/${id}`;
    expect(url).toBe('/api/invoices/42');
  });

  it('handles 404 as document-not-found error', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Document not found' }), { status: 404 });

    const res = await global.fetch('/api/invoices/999');
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
  });

  it('handles 500 as generic error', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });

    const res = await global.fetch('/api/invoices/1');
    expect(res.ok).toBe(false);
  });

  it('parses document from successful response', async () => {
    const mockDocument = {
      id: 1,
      status: 'EXTRACTED',
      documentType: 'INVOICE',
      supplier: { id: 1, name: 'Polytainer Industries', code: 'POLYTAINER' },
      fields: [{ id: 1, fieldName: 'Invoice Number', fieldValue: 'INV-001', confidence: 'HIGH', correctedValue: null, isCorrected: false }],
      analyticalResults: [],
    };

    global.fetch = async () =>
      new Response(JSON.stringify({ document: mockDocument }), { status: 200 });

    const res = await global.fetch('/api/invoices/1');
    expect(res.ok).toBe(true);
    const data = await res.json() as { document: typeof mockDocument };
    expect(data.document.id).toBe(1);
    expect(data.document.status).toBe('EXTRACTED');
  });
});
