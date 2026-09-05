// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import AppProviders from '../src/app/providers'

// Router smoke test against the real route tree: an unknown path lands on a
// STABLE 404 (no rewrite, no loop), and the final /auth/* paths resolve.

vi.mock('@services/analytics', () => ({
  useAppAnalytics: () => ({ track: vi.fn() }),
  AnalyticsEvent: new Proxy({}, { get: (_t, key) => String(key) }),
  useTrackView: vi.fn(),
}))

describe('route tree', () => {
  test('smoke: unknown 404s are stable and /auth/login resolves', async () => {
    const { router } = await import('../src/app/router')
    const { getByText, unmount } = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )

    router.navigate('/orgs/demo/this-does-not-exist')
    await waitFor(() => expect(getByText('404!')).toBeTruthy(), { timeout: 20000 })

    // a second unknown path must NOT accumulate prefixes — still just the 404
    router.navigate('/orgs/demo/also-missing')
    await waitFor(() => expect(getByText('404!')).toBeTruthy(), { timeout: 20000 })
    expect(window.location.pathname).toBe('/orgs/demo/also-missing')

    // final auth path resolves to the login form (localised copy may render
    // any language, so assert the structural email field instead)
    router.navigate('/auth/login')
    await waitFor(
      () => expect(document.querySelector('input[type="password"], input[type="email"]')).toBeTruthy(),
      { timeout: 20000 },
    )

    unmount()
    cleanup()
  }, 45000)
})
