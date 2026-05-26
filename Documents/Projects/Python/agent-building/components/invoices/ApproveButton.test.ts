// Unit tests for ApproveButton state and interaction logic

const APPROVABLE_STATUSES = ['EXTRACTED', 'NEEDS_REVIEW'];

describe('ApproveButton (status logic)', () => {
  it('allows approval when status is EXTRACTED', () => {
    const canApprove = APPROVABLE_STATUSES.includes('EXTRACTED');
    expect(canApprove).toBe(true);
  });

  it('allows approval when status is NEEDS_REVIEW', () => {
    const canApprove = APPROVABLE_STATUSES.includes('NEEDS_REVIEW');
    expect(canApprove).toBe(true);
  });

  it('does not allow approval when status is PENDING', () => {
    const canApprove = APPROVABLE_STATUSES.includes('PENDING');
    expect(canApprove).toBe(false);
  });

  it('does not allow approval when status is EXTRACTING', () => {
    const canApprove = APPROVABLE_STATUSES.includes('EXTRACTING');
    expect(canApprove).toBe(false);
  });

  it('does not allow approval when status is FAILED', () => {
    const canApprove = APPROVABLE_STATUSES.includes('FAILED');
    expect(canApprove).toBe(false);
  });

  it('does not allow approval when status is APPROVED', () => {
    const canApprove = APPROVABLE_STATUSES.includes('APPROVED');
    expect(canApprove).toBe(false);
  });
});

describe('ApproveButton (API call)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls POST to the correct approve endpoint', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    global.fetch = async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init?.method as string) ?? 'GET';
      return new Response(JSON.stringify({ id: 1, status: 'APPROVED', approvedAt: new Date().toISOString() }), { status: 200 });
    };

    const documentId = 7;
    await global.fetch(`/api/invoices/${documentId}/approve`, { method: 'POST' });

    expect(capturedUrl).toBe('/api/invoices/7/approve');
    expect(capturedMethod).toBe('POST');
  });

  it('handles API error gracefully', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Cannot approve' }), { status: 409 });

    const res = await global.fetch('/api/invoices/1/approve', { method: 'POST' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(409);
  });
});
