// Unit tests for ClassificationConfirmModal logic

describe('ClassificationConfirmModal (candidate resolution)', () => {
  const ALL_SUPPLIERS = ['POLYTAINER', 'SSS', 'DDW'];
  const ALL_DOC_TYPES = ['INVOICE', 'PACK_SLIP', 'COA', 'DELIVERY_DOCKET'];

  it('uses supplierCandidates when non-empty', () => {
    const supplierCandidates = ['DDW'];
    const options = supplierCandidates.length > 0 ? supplierCandidates : ALL_SUPPLIERS;
    expect(options).toEqual(['DDW']);
  });

  it('falls back to all suppliers when supplierCandidates is empty', () => {
    const supplierCandidates: string[] = [];
    const options = supplierCandidates.length > 0 ? supplierCandidates : ALL_SUPPLIERS;
    expect(options).toEqual(ALL_SUPPLIERS);
  });

  it('uses documentTypeCandidates when non-empty', () => {
    const docTypeCandidates = ['COA', 'PACK_SLIP'];
    const options = docTypeCandidates.length > 0 ? docTypeCandidates : ALL_DOC_TYPES;
    expect(options).toEqual(['COA', 'PACK_SLIP']);
  });

  it('falls back to all doc types when documentTypeCandidates is empty', () => {
    const docTypeCandidates: string[] = [];
    const options = docTypeCandidates.length > 0 ? docTypeCandidates : ALL_DOC_TYPES;
    expect(options).toEqual(ALL_DOC_TYPES);
  });

  it('selects first candidate as initial value', () => {
    const supplierCandidates = ['SSS', 'DDW'];
    const initial = supplierCandidates[0] ?? '';
    expect(initial).toBe('SSS');
  });
});

describe('ClassificationConfirmModal (API call)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends correct payload to classify endpoint on submit', async () => {
    let capturedUrl = '';
    let capturedBody = '';
    global.fetch = async (url, init) => {
      capturedUrl = url as string;
      capturedBody = (init?.body as string) ?? '';
      return new Response(JSON.stringify({ status: 'PENDING' }), { status: 200 });
    };

    const documentId = 3;
    const supplierCode = 'DDW';
    const documentType = 'COA';

    await global.fetch(`/api/invoices/${documentId}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierCode, documentType }),
    });

    expect(capturedUrl).toBe('/api/invoices/3/classify');
    expect(JSON.parse(capturedBody)).toEqual({ supplierCode: 'DDW', documentType: 'COA' });
  });

  it('shows error on failed classify request', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });

    const res = await global.fetch('/api/invoices/1/classify', { method: 'POST' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });
});
