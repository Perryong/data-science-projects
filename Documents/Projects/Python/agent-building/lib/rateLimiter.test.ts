import { checkRateLimit } from './rateLimiter';

describe('checkRateLimit', () => {
  it('allows first 20 requests', () => {
    const ip = `test-${Date.now()}`;
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
  });
  it('blocks the 21st request from same IP', () => {
    const ip = `test-block-${Date.now()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).allowed).toBe(false);
  });
  it('allows a different IP independently', () => {
    const ip1 = `ip1-${Date.now()}`;
    const ip2 = `ip2-${Date.now()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(ip1);
    expect(checkRateLimit(ip2).allowed).toBe(true);
  });
  it('returns remaining count that decrements', () => {
    const ip = `remaining-${Date.now()}`;
    const first = checkRateLimit(ip);
    expect(first.remaining).toBe(19);
    const second = checkRateLimit(ip);
    expect(second.remaining).toBe(18);
  });
});
