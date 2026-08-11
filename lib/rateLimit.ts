// =============================================================================
// Best-effort in-memory rate limiter (fixed window per key/IP).
//
// HONEST LIMITATION: serverless functions are ephemeral and horizontally
// scaled, so this Map is per-instance, not global. It stops naive floods from a
// single warm instance but is NOT a hard guarantee across the fleet. The README
// lists "move to a shared store (Upstash Redis / Vercel KV)" as the next
// hardening step. Honeypot + Turnstile are the stronger abuse controls.
// =============================================================================

interface Hit {
  count: number;
  resetAt: number;
}

const store = new Map<string, Hit>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, max: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Opportunistic sweep to bound memory.
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }

  const hit = store.get(key);
  if (!hit || hit.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt, retryAfterSeconds: 0 };
  }

  hit.count += 1;
  const ok = hit.count <= max;
  return {
    ok,
    remaining: Math.max(0, max - hit.count),
    resetAt: hit.resetAt,
    retryAfterSeconds: ok ? 0 : Math.ceil((hit.resetAt - now) / 1000),
  };
}
