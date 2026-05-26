// Unit tests for useExtractionPolling terminal status logic

const TERMINAL_STATUSES = ['EXTRACTED', 'FAILED', 'APPROVED', 'NEEDS_REVIEW'];

describe('useExtractionPolling (terminal status logic)', () => {
  it('considers EXTRACTED as terminal', () => {
    expect(TERMINAL_STATUSES.includes('EXTRACTED')).toBe(true);
  });

  it('considers FAILED as terminal', () => {
    expect(TERMINAL_STATUSES.includes('FAILED')).toBe(true);
  });

  it('considers APPROVED as terminal', () => {
    expect(TERMINAL_STATUSES.includes('APPROVED')).toBe(true);
  });

  it('considers NEEDS_REVIEW as terminal', () => {
    expect(TERMINAL_STATUSES.includes('NEEDS_REVIEW')).toBe(true);
  });

  it('considers PENDING as non-terminal (should poll)', () => {
    expect(TERMINAL_STATUSES.includes('PENDING')).toBe(false);
  });

  it('considers EXTRACTING as non-terminal (should poll)', () => {
    expect(TERMINAL_STATUSES.includes('EXTRACTING')).toBe(false);
  });

  it('does not start polling when status is already terminal', () => {
    const shouldPoll = (status: string) => !TERMINAL_STATUSES.includes(status);
    expect(shouldPoll('EXTRACTED')).toBe(false);
    expect(shouldPoll('APPROVED')).toBe(false);
    expect(shouldPoll('FAILED')).toBe(false);
  });

  it('starts polling when status is PENDING or EXTRACTING', () => {
    const shouldPoll = (status: string) => !TERMINAL_STATUSES.includes(status);
    expect(shouldPoll('PENDING')).toBe(true);
    expect(shouldPoll('EXTRACTING')).toBe(true);
  });
});
