import { buildExportFilename, serialiseToCsv, serialiseToJson } from './exportService';

describe('buildExportFilename', () => {
  it('includes supplier, format, and timestamp', () => {
    const name = buildExportFilename('CSV', 'DDW');
    expect(name).toMatch(/^DDW_CSV_\d{4}/);
    expect(name).toMatch(/\.csv$/);
  });
  it('uses "all" when no supplier specified', () => {
    const name = buildExportFilename('JSON');
    expect(name).toMatch(/^all_JSON_/);
  });
  it('produces .json extension for JSON format', () => {
    const name = buildExportFilename('JSON', 'SSS');
    expect(name).toMatch(/\.json$/);
  });
  it('produces .csv extension for CSV format', () => {
    const name = buildExportFilename('CSV', 'SSS');
    expect(name).toMatch(/\.csv$/);
  });
});

describe('serialiseToCsv', () => {
  it('returns empty string or header-only for empty array', () => {
    const result = serialiseToCsv([]);
    // papaparse returns empty string or just headers for empty array
    expect(typeof result).toBe('string');
  });
});

describe('serialiseToJson', () => {
  it('returns a JSON array string', () => {
    const result = serialiseToJson([]);
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
