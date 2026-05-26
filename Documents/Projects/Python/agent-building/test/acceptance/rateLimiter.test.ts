/**
 * Acceptance tests: Rate Limiter
 *
 * The rate limiter protects sensitive extraction endpoints (AC10 prerequisite).
 * Tests verify sliding-window behaviour: 20 requests per IP per hour allowed,
 * 21st is blocked; IPs are isolated; remaining count is accurate.
 *
 * checkRateLimit is a pure in-memory function — no DB or external dependencies.
 *
 * Note: lib/rateLimiter.test.ts covers the same pure function. These acceptance
 * tests re-state the user-visible behaviour (endpoint protection contract) and
 * confirm the rate-limit return values satisfy what the extract route relies on.
 */

import { checkRateLimit } from '@/lib/rateLimiter';

// ---------------------------------------------------------------------------
// Core rate limit behaviour (endpoint protection contract)
// ---------------------------------------------------------------------------
describe('Rate limiter – endpoint protection contract', () => {
  it('allows the first request from a new IP (allowed=true)', () => {
    const ip = `ac-ip-first-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
  });

  it('allows up to 20 requests per hour per IP', () => {
    const ip = `ac-ip-20-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
  });

  it('blocks the 21st request from the same IP within the window', () => {
    const ip = `ac-ip-block-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('blocked request returns remaining=0', () => {
    const ip = `ac-ip-rem0-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).remaining).toBe(0);
  });

  it('each IP is rate-limited independently', () => {
    const ip1 = `ac-iso-a-${Date.now()}-${Math.random()}`;
    const ip2 = `ac-iso-b-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(ip1);
    // ip1 is now blocked — ip2 should still be allowed
    expect(checkRateLimit(ip2).allowed).toBe(true);
    expect(checkRateLimit(ip1).allowed).toBe(false);
  });

  it('remaining decrements correctly after each allowed request', () => {
    const ip = `ac-ip-decr-${Date.now()}-${Math.random()}`;
    const r1 = checkRateLimit(ip);
    expect(r1.remaining).toBe(19); // 20 - 1
    const r2 = checkRateLimit(ip);
    expect(r2.remaining).toBe(18); // 20 - 2
    const r3 = checkRateLimit(ip);
    expect(r3.remaining).toBe(17); // 20 - 3
  });

  it('remaining reaches 0 on the 20th request', () => {
    const ip = `ac-ip-zero-${Date.now()}-${Math.random()}`;
    let last = { allowed: false, remaining: -1 };
    for (let i = 0; i < 20; i++) {
      last = checkRateLimit(ip);
    }
    expect(last.remaining).toBe(0);
    expect(last.allowed).toBe(true); // 20th request is still allowed
  });
});
