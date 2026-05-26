import { validatePdfFile, computeFileHash } from './uploadService';

describe('validatePdfFile', () => {
  it('rejects non-PDF MIME type', async () => {
    await expect(
      validatePdfFile(Buffer.from('test'), 'file.docx', 'application/msword')
    ).rejects.toThrow('Only PDF files are accepted');
  });
  it('rejects zero-byte buffer', async () => {
    await expect(
      validatePdfFile(Buffer.alloc(0), 'file.pdf', 'application/pdf')
    ).rejects.toThrow('File is empty');
  });
  it('rejects file with .pdf extension but wrong MIME type', async () => {
    await expect(
      validatePdfFile(Buffer.from('test'), 'file.pdf', 'application/msword')
    ).rejects.toThrow('Only PDF files are accepted');
  });
});

describe('computeFileHash', () => {
  it('returns consistent SHA-256 hex for same input', () => {
    const buf = Buffer.from('hello');
    expect(computeFileHash(buf)).toBe(computeFileHash(buf));
  });
  it('returns different hashes for different inputs', () => {
    expect(computeFileHash(Buffer.from('a'))).not.toBe(computeFileHash(Buffer.from('b')));
  });
  it('returns a 64-character hex string', () => {
    const hash = computeFileHash(Buffer.from('test'));
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
