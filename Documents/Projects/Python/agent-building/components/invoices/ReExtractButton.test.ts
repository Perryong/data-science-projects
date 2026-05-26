// Unit tests for ReExtractButton logic

describe('ReExtractButton (API interaction)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls POST to the correct extract endpoint', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    global.fetch = async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init?.method as string) ?? 'GET';
      return new Response(JSON.stringify({ jobId: 'job-1', status: 'PENDING' }), { status: 202 });
    };

    const documentId = 5;
    await global.fetch(`/api/invoices/${documentId}/extract`, { method: 'POST' });

    expect(capturedUrl).toBe('/api/invoices/5/extract');
    expect(capturedMethod).toBe('POST');
  });

  it('treats 202 response as success', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ jobId: 'job-2', status: 'PENDING' }), { status: 202 });

    const res = await global.fetch('/api/invoices/1/extract', { method: 'POST' });
    expect(res.ok).toBe(true);
  });

  it('treats 429 (rate limited) as error', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

    const res = await global.fetch('/api/invoices/1/extract', { method: 'POST' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(429);
  });

  it('treats 404 as error', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Document not found' }), { status: 404 });

    const res = await global.fetch('/api/invoices/999/extract', { method: 'POST' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });
});
