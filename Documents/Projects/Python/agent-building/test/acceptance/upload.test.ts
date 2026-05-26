/**
 * Acceptance tests: Upload (AC1, AC2, AC25, EC5, EC11)
 *
 * AC1: Upload PDF; UI accepts .pdf only, rejects others with visible error naming the file.
 * AC2: Uploaded PDF stored persistently and retrievable.
 * AC25: Invalid/corrupt/zero-byte PDF rejected at upload.
 * EC5: Duplicate upload → warn, no new record.
 * EC11: PDF unavailable → 404 from upload endpoint.
 *
 * Tests validatePdfFile (pure) and checkDuplicate (DB-gated).
 * storeFile / createDocumentRecord / checkDuplicate require DATABASE_URL.
 */

import {
  validatePdfFile,
  computeFileHash,
  checkDuplicate,
  UploadValidationError,
} from '@/services/uploadService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MINIMAL_PDF_HEADER = Buffer.from('%PDF-1.4');

// A minimal real PDF that pdf-parse can successfully open (1-page, empty content).
// We use a well-known minimal valid PDF byte sequence.
function makeValidPdfBuffer(): Buffer {
  const content = [
    '%PDF-1.4',
    '1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj',
    '2 0 obj<</Type /Pages /Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type /Page /MediaBox[0 0 3 3]>>endobj',
    'xref',
    '0 4',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000115 00000 n ',
    'trailer<</Size 4/Root 1 0 R>>',
    'startxref',
    '190',
    '%%EOF',
  ].join('\n');
  return Buffer.from(content);
}

// ---------------------------------------------------------------------------
// AC1: Only PDF files accepted — rejection names the file
// ---------------------------------------------------------------------------
describe('AC1 – Upload rejects non-PDF files with error naming the file', () => {
  it('rejects a .docx file with "Only PDF files are accepted: report.docx"', async () => {
    await expect(
      validatePdfFile(Buffer.from('not a pdf'), 'report.docx', 'application/msword')
    ).rejects.toThrow('Only PDF files are accepted: report.docx');
  });

  it('rejects a .png file with "Only PDF files are accepted: image.png"', async () => {
    await expect(
      validatePdfFile(Buffer.from('PNG data'), 'image.png', 'image/png')
    ).rejects.toThrow('Only PDF files are accepted: image.png');
  });

  it('rejects a file whose MIME is pdf but extension is not .pdf', async () => {
    await expect(
      validatePdfFile(Buffer.from('data'), 'invoice.txt', 'application/pdf')
    ).rejects.toThrow('Only PDF files are accepted: invoice.txt');
  });

  it('throws UploadValidationError (not a generic Error subclass)', async () => {
    await expect(
      validatePdfFile(Buffer.from('data'), 'file.docx', 'application/msword')
    ).rejects.toBeInstanceOf(UploadValidationError);
  });
});

// ---------------------------------------------------------------------------
// AC25: Invalid/corrupt/zero-byte PDF rejected at upload
// ---------------------------------------------------------------------------
describe('AC25 – Corrupt or zero-byte PDFs are rejected', () => {
  it('rejects a zero-byte buffer with "File is empty: empty.pdf"', async () => {
    await expect(
      validatePdfFile(Buffer.alloc(0), 'empty.pdf', 'application/pdf')
    ).rejects.toThrow('File is empty: empty.pdf');
  });

  it('rejects corrupt PDF bytes (non-parseable) with a descriptive error', async () => {
    // A buffer that looks like a PDF by extension/mime but has garbage content
    const corruptBuffer = Buffer.from('%PDF-1.4 CORRUPT GARBAGE CONTENT that will not parse');
    await expect(
      validatePdfFile(corruptBuffer, 'corrupt.pdf', 'application/pdf')
    ).rejects.toThrow('This PDF could not be read. It may be password-protected or corrupt: corrupt.pdf');
  });

  it('throws UploadValidationError for corrupt PDF', async () => {
    const corruptBuffer = Buffer.from('%PDF-1.4 NOT A REAL PDF');
    await expect(
      validatePdfFile(corruptBuffer, 'corrupt.pdf', 'application/pdf')
    ).rejects.toBeInstanceOf(UploadValidationError);
  });
});

// ---------------------------------------------------------------------------
// AC2: File hash is computable and stable (prerequisite for persistence)
// ---------------------------------------------------------------------------
describe('AC2 – File is hashable for persistence and deduplication', () => {
  it('computes a deterministic 64-char SHA-256 hex hash from buffer', () => {
    const buf = Buffer.from('stable content');
    const hash = computeFileHash(buf);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
    expect(computeFileHash(buf)).toBe(hash); // deterministic
  });

  it('produces distinct hashes for distinct files', () => {
    const h1 = computeFileHash(Buffer.from('invoice-a'));
    const h2 = computeFileHash(Buffer.from('invoice-b'));
    expect(h1).not.toBe(h2);
  });
});

// ---------------------------------------------------------------------------
// EC5: Duplicate upload → checkDuplicate returns existing record (DB-gated)
// ---------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL;
const describeIfDb = DATABASE_URL ? describe : describe.skip;

describeIfDb('EC5 – Duplicate upload returns existing document (no new record)', () => {
  // Uses the real DB; relies on the builder pattern (hash uniqueness in schema)
  it('checkDuplicate returns the existing document for a known hash', async () => {
    const { buildInvoiceDocument } = await import('@/test/builders/invoiceDocumentBuilder');
    const { prisma } = await import('@/lib/prisma');

    const knownHash = `dup-hash-${Date.now()}`;
    const existing = await buildInvoiceDocument({ fileHash: knownHash });

    const found = await checkDuplicate(knownHash);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(existing.id);

    await prisma.invoiceDocument.delete({ where: { id: existing.id } });
    await prisma.$disconnect();
  });

  it('checkDuplicate returns null for an unknown hash', async () => {
    const found = await checkDuplicate('000-nonexistent-hash-xyz');
    expect(found).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// EC11: PDF unavailable → 404 from uploads route
// ---------------------------------------------------------------------------
describe('EC11 – File serve route returns 404 for missing file', () => {
  // We test the route handler directly in Node (not the HTTP layer) because
  // Next.js App Router handlers are plain async functions.
  it('returns 404 JSON when file does not exist in UPLOAD_DIR', async () => {
    // Dynamically import to avoid module-level side effects with Next.js
    const { GET } = await import('@/app/api/uploads/[filename]/route');
    const { NextRequest } = await import('next/server');

    const req = new NextRequest('http://localhost/api/uploads/nonexistent-file-xyz.pdf');
    const res = await GET(req, { params: { filename: 'nonexistent-file-xyz.pdf' } });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
