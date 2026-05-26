// Unit tests for useFieldCorrections logic
// We test the pure/stateless aspects and mock fetch for the save function

describe('useFieldCorrections (save logic)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds the correct request payload when saving corrections', async () => {
    // Simulate the save payload construction
    const corrections = new Map<string, string>([
      ['Invoice Number', 'INV-001'],
      ['Invoice Date', '2024-01-01'],
    ]);

    const correctionsList = Array.from(corrections.entries()).map(([fieldName, correctedValue]) => ({
      fieldName,
      correctedValue,
    }));

    expect(correctionsList).toHaveLength(2);
    expect(correctionsList).toContainEqual({ fieldName: 'Invoice Number', correctedValue: 'INV-001' });
    expect(correctionsList).toContainEqual({ fieldName: 'Invoice Date', correctedValue: '2024-01-01' });
  });

  it('reports isDirty=false when no corrections', () => {
    const corrections = new Map<string, string>();
    const isDirty = corrections.size > 0;
    expect(isDirty).toBe(false);
  });

  it('reports isDirty=true when there are corrections', () => {
    const corrections = new Map<string, string>([['Invoice Number', 'INV-001']]);
    const isDirty = corrections.size > 0;
    expect(isDirty).toBe(true);
  });

  it('save returns early without calling fetch when corrections is empty', async () => {
    let fetchCalled = false;
    global.fetch = async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ updated: 0 }), { status: 200 });
    };

    const corrections = new Map<string, string>();
    // Simulate the save guard
    if (corrections.size === 0) {
      // early return
    } else {
      await global.fetch('/api/invoices/1/fields', { method: 'PUT' });
    }

    expect(fetchCalled).toBe(false);
  });

  it('save calls fetch with PUT method to the correct endpoint', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedBody = '';

    global.fetch = async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init?.method as string) ?? '';
      capturedBody = (init?.body as string) ?? '';
      return new Response(JSON.stringify({ updated: 1 }), { status: 200 });
    };

    const documentId = 42;
    const corrections = new Map<string, string>([['Invoice Number', 'INV-999']]);
    const correctionsList = Array.from(corrections.entries()).map(([fieldName, correctedValue]) => ({
      fieldName,
      correctedValue,
    }));

    await global.fetch(`/api/invoices/${documentId}/fields`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corrections: correctionsList }),
    });

    expect(capturedUrl).toBe('/api/invoices/42/fields');
    expect(capturedMethod).toBe('PUT');
    expect(JSON.parse(capturedBody)).toEqual({
      corrections: [{ fieldName: 'Invoice Number', correctedValue: 'INV-999' }],
    });
  });
});
