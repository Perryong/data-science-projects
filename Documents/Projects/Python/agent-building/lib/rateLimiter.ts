// Sliding-window rate limiter. Single-process only — not Redis-backed.
const store = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (store.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) {
    store.set(ip, timestamps);
    return { allowed: false, remaining: 0 };
  }
  timestamps.push(now);
  store.set(ip, timestamps);
  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length };
}
