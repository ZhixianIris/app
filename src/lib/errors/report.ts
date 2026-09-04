// Error reporting plumbing. The upstream app piped these calls into
// @sentry/nextjs; this SPA ships without an error-reporting SaaS dependency,
// so the wrappers degrade to console logging while keeping the same call
// surface for the error UIs.

export function captureError(error: unknown, _context?: Record<string, unknown>): string | undefined {
  console.error(error)
  return undefined
}

/** Is a reporting backend wired up? Used to show/hide the "Report" button. */
export function isReportingAvailable(): boolean {
  return false
}

export function openFeedbackDialog(_opts?: {
  eventId?: string
  user?: { name?: string; email?: string }
}): void {
  // No reporting backend configured.
}

export function lastEventId(): string | undefined {
  return undefined
}
