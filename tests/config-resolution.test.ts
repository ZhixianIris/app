// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest'

// Config resolution is browser-only (window.__RUNTIME_CONFIG__ →
// import.meta.env → default), so these tests run in jsdom and must reload the
// module per scenario.

function loadConfigModule() {
  return import('../src/services/config/config')
}

afterEach(() => {
  vi.unstubAllEnvs()
  delete (window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__
  vi.resetModules()
})

describe('getConfig resolution order', () => {
  test('runtime config wins over import.meta.env and the default', async () => {
    vi.stubEnv('VITE_TEST_ONLY', 'from-env')
    ;(window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__ = {
      VITE_TEST_ONLY: 'from-runtime',
    }
    const { getConfig } = await loadConfigModule()
    expect(getConfig('VITE_TEST_ONLY', 'fallback')).toBe('from-runtime')
  })

  test('import.meta.env is used when runtime config is absent', async () => {
    vi.stubEnv('VITE_TEST_ONLY', 'from-env')
    const { getConfig } = await loadConfigModule()
    expect(getConfig('VITE_TEST_ONLY', 'fallback')).toBe('from-env')
  })

  test('the default wins when neither source has the key', async () => {
    const { getConfig } = await loadConfigModule()
    expect(getConfig('VITE_DEFINITELY_MISSING', 'fallback')).toBe('fallback')
  })

  test('no Node globals are required (browser-only contract)', async () => {
    const { getConfig } = await loadConfigModule()
    expect(() => getConfig('VITE_ANYTHING')).not.toThrow()
  })
})

describe('getUriWithOrg final semantics', () => {
  test('always prefixes org-scoped URLs with /orgs/{slug}', async () => {
    const { getUriWithOrg } = await loadConfigModule()
    expect(getUriWithOrg('demo', '/dash/courses')).toBe('/orgs/demo/dash/courses')
    expect(getUriWithOrg('demo', '/')).toBe('/orgs/demo/')
  })

  test('returns the bare path when no org slug is given', async () => {
    const { getUriWithOrg } = await loadConfigModule()
    expect(getUriWithOrg('', '/dash/courses')).toBe('/dash/courses')
  })
})
