import { buildExtractionPrompt, parseClaudeResponse } from './extractionService';
import { FIELD_DEFINITIONS } from '@/lib/fieldDefinitions';

describe('buildExtractionPrompt', () => {
  it('includes all POLYTAINER INVOICE fields', () => {
    const prompt = buildExtractionPrompt('POLYTAINER', 'INVOICE', 'sample text');
    for (const field of FIELD_DEFINITIONS['POLYTAINER_INVOICE']) {
      expect(prompt).toContain(field);
    }
  });
  it('includes all SSS INVOICE fields', () => {
    const prompt = buildExtractionPrompt('SSS', 'INVOICE', 'sample text');
    for (const field of FIELD_DEFINITIONS['SSS_INVOICE']) {
      expect(prompt).toContain(field);
    }
  });
  it('includes all DDW INVOICE fields', () => {
    const prompt = buildExtractionPrompt('DDW', 'INVOICE', 'sample text');
    for (const field of FIELD_DEFINITIONS['DDW_INVOICE']) {
      expect(prompt).toContain(field);
    }
  });
  it('includes analyticalResults instruction for DDW COA', () => {
    const prompt = buildExtractionPrompt('DDW', 'COA', 'sample text');
    expect(prompt).toContain('analyticalResults');
    for (const field of FIELD_DEFINITIONS['DDW_COA']) {
      expect(prompt).toContain(field);
    }
  });
});

describe('parseClaudeResponse', () => {
  it('maps all expected fields and sets confidence per field', () => {
    const response = JSON.stringify({
      'Invoice Number': 'PTI86042',
      'Invoice Number_confidence': 'HIGH',
      'Invoice Date': '2025-01-15',
      'Invoice Date_confidence': 'HIGH',
    });
    const { fields } = parseClaudeResponse(response, 'POLYTAINER', 'INVOICE');
    const invNum = fields.find(f => f.fieldName === 'Invoice Number');
    expect(invNum?.fieldValue).toBe('PTI86042');
    expect(invNum?.confidence).toBe('HIGH');
  });
  it('sets missing fields to null with LOW confidence', () => {
    const { fields } = parseClaudeResponse('{}', 'POLYTAINER', 'INVOICE');
    expect(fields.every(f => f.fieldValue === null && f.confidence === 'LOW')).toBe(true);
  });
  it('returns all expected fields even when Claude returns partial response', () => {
    const { fields } = parseClaudeResponse('{}', 'POLYTAINER', 'INVOICE');
    expect(fields.map(f => f.fieldName)).toEqual(FIELD_DEFINITIONS['POLYTAINER_INVOICE']);
  });
  it('handles null values without error (Edge Case 7)', () => {
    const response = JSON.stringify({ 'Invoice Number': null, 'Invoice Number_confidence': 'LOW' });
    const { fields } = parseClaudeResponse(response, 'POLYTAINER', 'INVOICE');
    const invNum = fields.find(f => f.fieldName === 'Invoice Number');
    expect(invNum?.fieldValue).toBeNull();
  });
  it('handles zero analytical result rows for DDW COA (Edge Case 8)', () => {
    const response = JSON.stringify({ analyticalResults: [] });
    const { analyticalResults } = parseClaudeResponse(response, 'DDW', 'COA');
    expect(analyticalResults).toHaveLength(0);
  });
  it('handles malformed JSON without throwing (fallback to all null)', () => {
    expect(() => parseClaudeResponse('not json', 'POLYTAINER', 'INVOICE')).not.toThrow();
    const { fields } = parseClaudeResponse('not json', 'POLYTAINER', 'INVOICE');
    expect(fields.every(f => f.fieldValue === null)).toBe(true);
  });
  it('extracts analytical results for DDW COA', () => {
    const response = JSON.stringify({
      analyticalResults: [{ testId: 'pH', minValue: '3.0', maxValue: '4.0', testedValue: '3.5' }],
    });
    const { analyticalResults } = parseClaudeResponse(response, 'DDW', 'COA');
    expect(analyticalResults).toHaveLength(1);
    expect(analyticalResults[0].testId).toBe('pH');
  });
});
