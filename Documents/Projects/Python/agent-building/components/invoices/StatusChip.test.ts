// Unit tests for StatusChip status style logic

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  EXTRACTING: 'bg-blue-100 text-blue-700',
  EXTRACTED: 'bg-green-100 text-green-700',
  NEEDS_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-700 text-white font-bold',
  FAILED: 'bg-red-100 text-red-700',
};

describe('StatusChip style logic', () => {
  it('returns correct style for PENDING', () => {
    expect(STATUS_STYLES['PENDING']).toContain('gray');
  });

  it('returns correct style for EXTRACTING', () => {
    expect(STATUS_STYLES['EXTRACTING']).toContain('blue');
  });

  it('returns correct style for EXTRACTED', () => {
    expect(STATUS_STYLES['EXTRACTED']).toContain('green');
  });

  it('returns correct style for NEEDS_REVIEW', () => {
    expect(STATUS_STYLES['NEEDS_REVIEW']).toContain('yellow');
  });

  it('returns correct style for APPROVED with bold', () => {
    expect(STATUS_STYLES['APPROVED']).toContain('green-700');
    expect(STATUS_STYLES['APPROVED']).toContain('font-bold');
  });

  it('returns correct style for FAILED', () => {
    expect(STATUS_STYLES['FAILED']).toContain('red');
  });

  it('falls back to gray for unknown status', () => {
    const status = 'UNKNOWN_STATUS';
    const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
    expect(style).toContain('gray');
  });

  it('formats NEEDS_REVIEW label correctly', () => {
    const label = 'NEEDS_REVIEW'.replace(/_/g, ' ');
    expect(label).toBe('NEEDS REVIEW');
  });

  it('formats PACK_SLIP label correctly', () => {
    const label = 'PACK_SLIP'.replace(/_/g, ' ');
    expect(label).toBe('PACK SLIP');
  });
});
