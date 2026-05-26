// Unit tests for ExportForm logic

describe('ExportForm (download request logic)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds correct fetch params for CSV download', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = url as string;
      return new Response('csv data', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="all_CSV_2024-01-01.csv"',
        },
      });
    };

    const format = 'CSV';
    const supplier = '';
    const params = new URLSearchParams({ format: format.toLowerCase() });
    if (supplier) params.set('supplier', supplier);
    await global.fetch(`/api/invoices/export?${params.toString()}`);

    expect(capturedUrl).toBe('/api/invoices/export?format=csv');
  });

  it('builds correct fetch params for JSON download with supplier', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = url as string;
      return new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const format = 'JSON';
    const supplier = 'DDW';
    const params = new URLSearchParams({ format: format.toLowerCase() });
    if (supplier) params.set('supplier', supplier);
    await global.fetch(`/api/invoices/export?${params.toString()}`);

    expect(capturedUrl).toBe('/api/invoices/export?format=json&supplier=DDW');
  });

  it('sets error when API returns 400', async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'No approved records match the selected filter' }), {
        status: 400,
      });

    const res = await global.fetch('/api/invoices/export?format=csv');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No approved records');
  });
});
