// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// PostHogProvider must not blow up when the observers run inside the Router —
// and with no key configured it must be a pure pass-through.

vi.mock('posthog-js', () => ({ default: { init: vi.fn() } }))
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePostHog: () => null,
}))

function loadProvider() {
  return import('../src/components/Contexts/PostHogProvider')
}

function renderWithRouter(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/orgs/demo/dash']}>
      <Routes>
        <Route path="/orgs/:orgslug/dash" element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostHog observers stay inside the Router context', () => {
  test('renders children untouched when no PostHog key is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '')
    const mod = await loadProvider()
    const { container } = renderWithRouter(
      <mod.default>
        <p>plain children</p>
      </mod.default>,
    )
    expect(container.textContent).toContain('plain children')
    cleanup()
  })

  test('the observers render (as null) inside a Router without throwing', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key')
    const mod = await loadProvider()
    const { container } = renderWithRouter(<mod.PostHogRouteObservers />)
    expect(container).toBeTruthy()
    cleanup()
  })
})
