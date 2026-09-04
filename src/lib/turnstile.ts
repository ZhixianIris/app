// Cloudflare Turnstile support.
//
// In the original Next.js app the secret-key verification lived in a server
// route. In this SPA the Turnstile secret never reaches the browser, so
// verification is enforced by the backend API; the client only needs to know
// whether the widget should render and forward the token with the request.
// Without a public site key the gate degrades to "disabled" — matching the
// upstream OSS default.

/** True when the widget should render (public site key configured). */
export function isTurnstileEnabled(): boolean {
  return Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
}

export interface TurnstileResult {
  /** Whether the request should be allowed through. */
  ok: boolean
  /** Machine reason when not ok: 'disabled' never blocks. */
  reason?: 'missing_token' | 'verification_failed' | 'error'
  /** Raw Cloudflare error codes, for logging. */
  errorCodes?: string[]
}

/**
 * Client-side gate. Without a backend verification route the SPA cannot
 * enforce Turnstile itself; the backend rejects protected actions when its
 * own secret is configured and the token is missing/invalid.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  _remoteIp?: string | null,
): Promise<TurnstileResult> {
  if (!isTurnstileEnabled()) {
    return { ok: true }
  }
  if (!token) {
    return { ok: false, reason: 'missing_token' }
  }
  // Token presence is all the SPA can check; the API verifies it server-side.
  return { ok: true }
}
