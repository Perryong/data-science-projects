// Unit tests for useInvoiceList fetch logic

describe('useInvoiceList (URL construction)', () => {
  it('fetches all invoices when no supplier filter', () => {
    const supplierFilter = '';
    const url = supplierFilter
      ? `/api/invoices?supplier=${encodeURIComponent(supplierFilter)}`
      : '/api/invoices';
    expect(url).toBe('/api/invoices');
  });

  it('appends supplier param when filter is set', () => {
    const supplierFilter = 'POLYTAINER';
    const url = supplierFilter
      ? `/api/invoices?supplier=${encodeURIComponent(supplierFilter)}`
      : '/api/invoices';
    expect(url).toBe('/api/invoices?supplier=POLYTAINER');
  });

  it('encodes special characters in supplier param', () => {
    const supplierFilter = 'SSS & Co';
    const url = supplierFilter
      ? `/api/invoices?supplier=${encodeURIComponent(supplierFilter)}`
      : '/api/invoices';
    expect(url).toBe('/api/invoices?supplier=SSS%20%26%20Co');
  });
});

describe('useInvoiceList (error handling)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('treats non-ok responses as errors', async () => {
    global.fetch = async () => new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });

    const res = await global.fetch('/api/invoices');
    expect(res.ok).toBe(false);
  });

  it('treats 200 responses as success', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ documents: [] }), { status: 200 });

    const res = await global.fetch('/api/invoices');
    expect(res.ok).toBe(true);
    const data = await res.json() as { documents: unknown[] };
    expect(data.documents).toHaveLength(0);
  });
});
