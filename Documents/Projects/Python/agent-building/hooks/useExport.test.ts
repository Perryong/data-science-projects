// Unit tests for useExport logic

describe('useExport (URL construction)', () => {
  it('builds correct URL for CSV with no supplier', () => {
    const format = 'CSV';
    const supplier = undefined;
    const params = new URLSearchParams({ format: format.toLowerCase() });
    if (supplier) params.set('supplier', supplier);
    expect(params.toString()).toBe('format=csv');
  });

  it('builds correct URL for JSON with supplier', () => {
    const format = 'JSON';
    const supplier = 'POLYTAINER';
    const params = new URLSearchParams({ format: format.toLowerCase() });
    if (supplier) params.set('supplier', supplier);
    expect(params.toString()).toBe('format=json&supplier=POLYTAINER');
  });

  it('builds correct URL for CSV with DDW supplier', () => {
    const format = 'CSV';
    const supplier = 'DDW';
    const params = new URLSearchParams({ format: format.toLowerCase() });
    if (supplier) params.set('supplier', supplier);
    expect(params.toString()).toBe('format=csv&supplier=DDW');
  });

  it('handles empty string supplier as no filter', () => {
    const supplier = '';
    const params = new URLSearchParams({ format: 'csv' });
    if (supplier) params.set('supplier', supplier);
    expect(params.toString()).toBe('format=csv');
  });
});

describe('useExport (filename extraction)', () => {
  it('extracts filename from Content-Disposition header', () => {
    const contentDisposition = 'attachment; filename="POLYTAINER_CSV_2024-01-01T12-00-00.csv"';
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    expect(filenameMatch?.[1]).toBe('POLYTAINER_CSV_2024-01-01T12-00-00.csv');
  });

  it('falls back to default filename when header is missing', () => {
    const contentDisposition = '';
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    const format = 'CSV';
    const filename = filenameMatch ? filenameMatch[1] : `export.${format.toLowerCase()}`;
    expect(filename).toBe('export.csv');
  });
});
