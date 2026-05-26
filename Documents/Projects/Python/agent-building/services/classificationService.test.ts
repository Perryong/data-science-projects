import { classifySupplier, classifyDdwDocumentType } from './classificationService';

describe('classifySupplier', () => {
  it('returns POLYTAINER for "POLYTAINER INDUSTRIES"', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES SDN BHD');
    expect(r.candidates).toEqual(['POLYTAINER']);
    expect(r.confidence).toBe('certain');
  });
  it('returns SSS for "SAN SOON SENG"', () => {
    expect(classifySupplier('SAN SOON SENG FOOD INDUSTRIES').candidates).toEqual(['SSS']);
  });
  it('returns SSS for "SSSFI"', () => {
    expect(classifySupplier('Supplier: SSSFI').candidates).toEqual(['SSS']);
  });
  it('returns SSS for "THREE-A RESOURCES"', () => {
    expect(classifySupplier('THREE-A RESOURCES BHD').candidates).toEqual(['SSS']);
  });
  it('returns DDW for "DDW"', () => {
    expect(classifySupplier('DDW Colours Sdn Bhd').candidates).toEqual(['DDW']);
  });
  it('returns DDW for "D.D. Williamson"', () => {
    expect(classifySupplier('D.D. Williamson').candidates).toEqual(['DDW']);
  });
  it('returns DDW for "The Color House"', () => {
    expect(classifySupplier('The Color House').candidates).toEqual(['DDW']);
  });
  it('returns ambiguous when two supplier signals present', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES and DDW');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates.length).toBeGreaterThan(1);
  });
  it('returns ambiguous with empty candidates when no signal present', () => {
    const r = classifySupplier('Random Company Ltd');
    expect(r.candidates).toHaveLength(0);
    expect(r.confidence).toBe('ambiguous');
  });
});

describe('classifyDdwDocumentType', () => {
  it('returns COA for Certificate of Analysis', () => {
    expect(classifyDdwDocumentType('Certificate of Analysis').candidates).toEqual(['COA']);
  });
  it('returns PACK_SLIP for Pack Slip', () => {
    expect(classifyDdwDocumentType('Pack Slip No. 001').candidates).toEqual(['PACK_SLIP']);
  });
  it('returns DELIVERY_DOCKET for Delivery Docket', () => {
    expect(classifyDdwDocumentType('Delivery Docket').candidates).toEqual(['DELIVERY_DOCKET']);
  });
  it('returns INVOICE as fallback when no type signals', () => {
    expect(classifyDdwDocumentType('DDW Invoice 5503263').candidates).toEqual(['INVOICE']);
  });
  it('returns ambiguous when two type signals present', () => {
    const r = classifyDdwDocumentType('Certificate of Analysis and Delivery Docket');
    expect(r.confidence).toBe('ambiguous');
  });
});
