/**
 * Acceptance tests: Classification (AC4, AC5, AC6, AC7, EC1, EC2)
 *
 * AC4: Auto-classify supplier from text signals (pure function).
 * AC5: Auto-classify DDW document type (pure function).
 * AC6: Uncertain classification → needsUserConfirmation = true, candidates exposed.
 * AC7: Certain classification → needsUserConfirmation = false, no user input needed.
 * EC1: Multiple supplier signals → needsUserConfirmation (ambiguous).
 * EC2: DDW doc type ambiguity → needsUserConfirmation (ambiguous).
 *
 * classifySupplier and classifyDdwDocumentType are pure functions — no DB needed.
 * classifyDocument is DB-dependent (skipped when DATABASE_URL absent).
 */

import { classifySupplier, classifyDdwDocumentType, ClassificationOutcome } from '@/services/classificationService';

// ---------------------------------------------------------------------------
// AC4: Supplier classification from text signals
// ---------------------------------------------------------------------------
describe('AC4 – Auto-classify supplier from document text', () => {
  describe('POLYTAINER', () => {
    it('classifies "POLYTAINER INDUSTRIES" → POLYTAINER, certain', () => {
      const r = classifySupplier('POLYTAINER INDUSTRIES SDN BHD invoice 2025');
      expect(r.candidates).toEqual(['POLYTAINER']);
      expect(r.confidence).toBe('certain');
    });
  });

  describe('SSS', () => {
    it('classifies "SAN SOON SENG" → SSS, certain', () => {
      const r = classifySupplier('Sold By: SAN SOON SENG FOOD INDUSTRIES');
      expect(r.candidates).toEqual(['SSS']);
      expect(r.confidence).toBe('certain');
    });

    it('classifies "SSSFI" → SSS, certain', () => {
      const r = classifySupplier('Supplier Code: SSSFI');
      expect(r.candidates).toEqual(['SSS']);
      expect(r.confidence).toBe('certain');
    });

    it('classifies "THREE-A RESOURCES" → SSS, certain', () => {
      const r = classifySupplier('THREE-A RESOURCES BHD corporate supplier');
      expect(r.candidates).toEqual(['SSS']);
      expect(r.confidence).toBe('certain');
    });
  });

  describe('DDW', () => {
    it('classifies "DDW" → DDW, certain', () => {
      const r = classifySupplier('From: DDW Colours Pte Ltd');
      expect(r.candidates).toEqual(['DDW']);
      expect(r.confidence).toBe('certain');
    });

    it('classifies "D.D. WILLIAMSON" → DDW, certain', () => {
      const r = classifySupplier('D.D. Williamson international caramel');
      expect(r.candidates).toEqual(['DDW']);
      expect(r.confidence).toBe('certain');
    });

    it('classifies "THE COLOR HOUSE" → DDW, certain', () => {
      const r = classifySupplier('The Color House specialty ingredients');
      expect(r.candidates).toEqual(['DDW']);
      expect(r.confidence).toBe('certain');
    });
  });
});

// ---------------------------------------------------------------------------
// AC5: DDW document type classification
// ---------------------------------------------------------------------------
describe('AC5 – Auto-classify DDW document type', () => {
  it('classifies "Certificate of Analysis" → COA, certain', () => {
    const r = classifyDdwDocumentType('Certificate of Analysis\nProduct: Caramel');
    expect(r.candidates).toEqual(['COA']);
    expect(r.confidence).toBe('certain');
  });

  it('classifies "Analytical Results" → COA, certain', () => {
    const r = classifyDdwDocumentType('Analytical Results for Lot 12345');
    expect(r.candidates).toEqual(['COA']);
    expect(r.confidence).toBe('certain');
  });

  it('classifies "Packing List" → PACK_SLIP, certain', () => {
    const r = classifyDdwDocumentType('Packing List No. PL-001');
    expect(r.candidates).toEqual(['PACK_SLIP']);
    expect(r.confidence).toBe('certain');
  });

  it('classifies "Pack Slip" → PACK_SLIP, certain', () => {
    const r = classifyDdwDocumentType('Pack Slip 9900001');
    expect(r.candidates).toEqual(['PACK_SLIP']);
    expect(r.confidence).toBe('certain');
  });

  it('classifies "Delivery Docket" → DELIVERY_DOCKET, certain', () => {
    const r = classifyDdwDocumentType('Delivery Docket DKT-001');
    expect(r.candidates).toEqual(['DELIVERY_DOCKET']);
    expect(r.confidence).toBe('certain');
  });

  it('classifies "Delivery Note" → DELIVERY_DOCKET, certain', () => {
    const r = classifyDdwDocumentType('Delivery Note issued to customer');
    expect(r.candidates).toEqual(['DELIVERY_DOCKET']);
    expect(r.confidence).toBe('certain');
  });

  it('falls back to INVOICE when no other type signals present', () => {
    const r = classifyDdwDocumentType('DDW Invoice 5503263 Amount Due: USD 12,000');
    expect(r.candidates).toEqual(['INVOICE']);
    expect(r.confidence).toBe('certain');
  });
});

// ---------------------------------------------------------------------------
// AC6: Uncertain classification halts extraction, needsUserConfirmation = true
// ---------------------------------------------------------------------------
describe('AC6 – Uncertain supplier classification exposes needsUserConfirmation', () => {
  it('returns needsUserConfirmation-compatible result when no supplier signals present', () => {
    const r = classifySupplier('Random Vendor Ltd – No known signals');
    // confidence=ambiguous, candidates=0 → classifyDocument would set needsUserConfirmation=true
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toHaveLength(0);
  });

  it('returns ambiguous confidence when multiple supplier signals present', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES and DDW Colours on same document');
    expect(r.confidence).toBe('ambiguous');
  });
});

describe('AC6 – Uncertain DDW doc type exposes needsUserConfirmation', () => {
  it('returns ambiguous when both COA and DELIVERY_DOCKET signals present', () => {
    const r = classifyDdwDocumentType('Certificate of Analysis\nDelivery Docket No. 001');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates.length).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// AC7: Certain classification needs no user input
// ---------------------------------------------------------------------------
describe('AC7 – Certain classification has confidence=certain, single candidate', () => {
  it('POLYTAINER classification is certain with a single candidate', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES SDN BHD');
    expect(r.confidence).toBe('certain');
    expect(r.candidates).toHaveLength(1);
  });

  it('DDW COA classification is certain with a single candidate', () => {
    const r = classifyDdwDocumentType('Certificate of Analysis\nLot 12345');
    expect(r.confidence).toBe('certain');
    expect(r.candidates).toHaveLength(1);
  });

  it('SSS INVOICE classification is certain (fallback = INVOICE)', () => {
    // SSS docs are always INVOICE — only DDW gets sub-classification
    const supplier = classifySupplier('SAN SOON SENG FOOD INDUSTRIES');
    expect(supplier.confidence).toBe('certain');
    expect(supplier.candidates).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// EC1: Multiple supplier signals → ambiguous (needsUserConfirmation = true)
// ---------------------------------------------------------------------------
describe('EC1 – Multiple supplier signals produce ambiguous classification', () => {
  it('POLYTAINER + SSS signals → ambiguous, both candidates returned', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES and SAN SOON SENG combined');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toContain('POLYTAINER');
    expect(r.candidates).toContain('SSS');
  });

  it('SSS + DDW signals → ambiguous', () => {
    const r = classifySupplier('SSSFI supplier DDW trading');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toContain('SSS');
    expect(r.candidates).toContain('DDW');
  });

  it('All three suppliers on one doc → ambiguous with 3 candidates', () => {
    const r = classifySupplier('POLYTAINER INDUSTRIES SAN SOON SENG DDW');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// EC2: DDW doc type ambiguity → needsUserConfirmation
// ---------------------------------------------------------------------------
describe('EC2 – DDW doc type ambiguity results in multiple candidates', () => {
  it('Pack Slip + COA signals → ambiguous with both candidates', () => {
    const r = classifyDdwDocumentType('Pack Slip 001 with Analytical Results attached');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toContain('PACK_SLIP');
    expect(r.candidates).toContain('COA');
  });

  it('COA + DELIVERY_DOCKET signals → ambiguous', () => {
    const r = classifyDdwDocumentType('Certificate of Analysis - Delivery Note');
    expect(r.confidence).toBe('ambiguous');
    expect(r.candidates).toContain('COA');
    expect(r.candidates).toContain('DELIVERY_DOCKET');
  });
});
