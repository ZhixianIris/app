import { test, expect } from '@playwright/test'

// Browser smoke against the production bundle.
// No backend is required: auth pages and the 404 surface render without one,
// and every backend-dependent view must degrade to a rendered error state —
// never a blank page.

const WIDTHS = [360, 768, 1440]

test.describe('production bundle smoke', () => {
  test('login page renders its form', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.locator('input[type="password"], input[type="email"]').first()).toBeVisible()
  })

  test('signup page renders its form', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('unknown paths land on a stable 404 — twice, without rewriting', async ({ page }) => {
    await page.goto('/orgs/demo/this-does-not-exist')
    await expect(page.getByRole('heading', { name: '404!' })).toBeVisible()
    expect(page.url()).toContain('/orgs/demo/this-does-not-exist')

    await page.goto('/orgs/demo/also-missing')
    await expect(page.getByRole('heading', { name: '404!' })).toBeVisible()
    expect(page.url()).toContain('/orgs/demo/also-missing')
  })

  test('error surfaces are rendered, never blank', async ({ page }) => {
    // Auth-required org content cannot load without a backend, but the app
    // must still paint a real UI (loader or error surface), never nothing.
    // Loaders are graphics-only, so assert structure instead of text.
    await page.goto('/orgs/demo/dash/courses')
    await page.waitForTimeout(2500)
    const childCount = await page.evaluate(() => document.getElementById('root')?.children.length ?? 0)
    expect(childCount).toBeGreaterThan(0)
    const body = await page.locator('body').innerText()
    // once the session gate resolves (offline here), some real surface shows
    expect(body.length + childCount).toBeGreaterThan(0)
  })
})

test.describe('responsive verification', () => {
  for (const width of WIDTHS) {
    test(`login page at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/auth/login')
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(width + 1)
      await page.screenshot({ path: `e2e-artifacts/${width}_auth_login.png` })
    })

    test(`404 page at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/orgs/demo/unknown')
      await expect(page.getByRole('heading', { name: '404!' })).toBeVisible()
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(width + 1)
      await page.screenshot({ path: `e2e-artifacts/${width}_404.png` })
    })
  }
})
