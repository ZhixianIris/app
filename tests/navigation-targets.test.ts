// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import { getLoginCallbackUrl } from '../src/lib/auth/events'
import { resolveSearchHref } from '../src/lib/dashboard-search/registry'

describe('session-expiry login target', () => {
  test('ordinary users land on /auth/login — never the removed /login', () => {
    expect(getLoginCallbackUrl('/orgs/demo/dash/courses')).toBe('/auth/login')
    expect(getLoginCallbackUrl('/home')).toBe('/auth/login')
  })

  test('admin-area pages keep their own login surface', () => {
    expect(getLoginCallbackUrl('/admin/organizations')).toBe('/admin/login')
  })
})

describe('command palette href resolution', () => {
  test('org-relative results get the final /orgs/{slug} prefix', () => {
    expect(resolveSearchHref('/dash/courses', 'demo')).toBe('/orgs/demo/dash/courses')
    expect(resolveSearchHref('/dash/courses/course/course_1/general', 'demo')).toBe(
      '/orgs/demo/dash/courses/course/course_1/general',
    )
  })

  test('already-final /orgs/ paths are not double-prefixed', () => {
    expect(resolveSearchHref('/orgs/demo/dash/courses', 'demo')).toBe('/orgs/demo/dash/courses')
  })

  test('external links pass through untouched', () => {
    expect(resolveSearchHref('https://example.com/x', 'demo')).toBe('https://example.com/x')
  })

  test('a missing org slug leaves the path as-is (apex 404 surface)', () => {
    expect(resolveSearchHref('/dash/courses', null)).toBe('/dash/courses')
  })
})
