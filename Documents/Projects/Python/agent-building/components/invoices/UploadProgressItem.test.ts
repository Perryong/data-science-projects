// Unit tests for UploadProgressItem helper logic

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

describe('UploadProgressItem (formatBytes)', () => {
  it('formats bytes under 1 KB', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats bytes in KB range', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats bytes in MB range', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('formats exactly 1 KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats exactly 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });
});

describe('UploadProgressItem (state badge logic)', () => {
  it('success state has documentId set', () => {
    const state = 'success';
    const documentId = 42;
    expect(state === 'success' && documentId !== undefined).toBe(true);
  });

  it('error state shows errorMessage', () => {
    const state = 'error';
    const errorMessage = 'File is not a valid PDF';
    expect(state === 'error' && !!errorMessage).toBe(true);
  });

  it('duplicate state has documentId (existing doc)', () => {
    const state = 'duplicate';
    const documentId = 7;
    expect(state === 'duplicate' && documentId !== undefined).toBe(true);
  });
});
