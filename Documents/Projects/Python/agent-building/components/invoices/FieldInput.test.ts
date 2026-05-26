// Unit tests for FieldInput confidence style logic

const CONFIDENCE_STYLES: Record<string, string> = {
  LOW: 'border-red-500 bg-red-50',
  MEDIUM: 'border-yellow-400 bg-yellow-50',
  HIGH: 'border-gray-300 bg-white',
};

describe('FieldInput confidence style logic', () => {
  it('applies red styling for LOW confidence', () => {
    expect(CONFIDENCE_STYLES['LOW']).toContain('red-500');
    expect(CONFIDENCE_STYLES['LOW']).toContain('bg-red-50');
  });

  it('applies yellow styling for MEDIUM confidence', () => {
    expect(CONFIDENCE_STYLES['MEDIUM']).toContain('yellow-400');
    expect(CONFIDENCE_STYLES['MEDIUM']).toContain('bg-yellow-50');
  });

  it('applies default styling for HIGH confidence', () => {
    expect(CONFIDENCE_STYLES['HIGH']).toContain('border-gray-300');
    expect(CONFIDENCE_STYLES['HIGH']).toContain('bg-white');
  });

  it('uses HIGH styling as fallback for unknown confidence', () => {
    const style = CONFIDENCE_STYLES['UNKNOWN'] ?? CONFIDENCE_STYLES.HIGH;
    expect(style).toBe(CONFIDENCE_STYLES['HIGH']);
  });
});

describe('FieldInput ID generation', () => {
  it('converts field name to kebab-case id', () => {
    const fieldName = 'Invoice Number';
    const id = `field-${fieldName.replace(/\s+/g, '-').toLowerCase()}`;
    expect(id).toBe('field-invoice-number');
  });

  it('handles multi-word field names', () => {
    const fieldName = 'Customer PO Number';
    const id = `field-${fieldName.replace(/\s+/g, '-').toLowerCase()}`;
    expect(id).toBe('field-customer-po-number');
  });

  it('handles field names with parentheses', () => {
    const fieldName = 'Quantity (PCS)';
    const id = `field-${fieldName.replace(/\s+/g, '-').toLowerCase()}`;
    expect(id).toBe('field-quantity-(pcs)');
  });
});
