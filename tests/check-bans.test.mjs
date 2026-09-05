// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// The CI scanner must never fail open: banned content → exit 1, clean tree →
// exit 0, and any scanner error (missing root, bad usage) → non-zero too.
// Fixtures are isolated in a temp dir so the checker cannot match its own
// rule text.

const CHECKER = path.resolve(import.meta.dirname, '../scripts/check-bans.mjs')

let fixtureRoot

beforeAll(() => {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'check-bans-fixture-'))
  fs.writeFileSync(path.join(fixtureRoot, 'clean.ts'), 'export const x = 1\n')
  fs.mkdirSync(path.join(fixtureRoot, 'nested'))
})

afterAll(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
})

function run(args) {
  return spawnSync(process.execPath, [CHECKER, ...args], { encoding: 'utf8' })
}

describe('check-bans scanner', () => {
  test('a clean tree passes (exit 0)', () => {
    const r = run([fixtureRoot])
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('clean')
  })

  test('injected brand word fails (exit 1)', () => {
    const file = path.join(fixtureRoot, 'brand.ts')
    fs.writeFileSync(file, `// [ 'learn', 'house' ] joined below\nconst brand = ['learn', 'house'].join('')\nconst name = ['learn', 'house'].join('-')\nvoid name\n`)
    // the fixture above is deliberately assembled from fragments; write the
    // real banned literal here in a way the scanner must catch:
    const joined = ['learn', 'house'].join('')
    fs.writeFileSync(file, `const name = "${joined}"\n`)
    const r = run([fixtureRoot])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('brand word')
    fs.rmSync(file)
  })

  test('injected Radix import fails (exit 1)', () => {
    const file = path.join(fixtureRoot, 'radix.ts')
    const pkg = '@' + ['radix', 'ui'].join('-') + '/react-dialog'
    fs.writeFileSync(file, `import { Dialog } from '${pkg}'\n`)
    const r = run([fixtureRoot])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('Radix import')
    fs.rmSync(file)
  })

  test('injected Radix slot-prop/state-selector fails (exit 1)', () => {
    const file = path.join(fixtureRoot, 'api.tsx')
    const slotProp = ['as', 'Child'].join('')
    fs.writeFileSync(file, `const props = { ['${slotProp}']: true }
`)
    const r = run([fixtureRoot])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain(slotProp)
    fs.rmSync(file)
    const file2 = path.join(fixtureRoot, 'css.ts')
    const attr = 'data-' + '[state='.slice(0)
    fs.writeFileSync(file2, `const cls = '.x[${attr}open]:y'\n`)
    const r2 = run([fixtureRoot])
    expect(r2.status).toBe(1)
    expect(r2.stderr).toContain('state attribute')
    fs.rmSync(file2)
  })

  test('a banned filename fails (exit 1)', () => {
    const joined = ['learn', 'house'].join('')
    const file = path.join(fixtureRoot, `${joined}-logo.png`)
    fs.writeFileSync(file, Buffer.from([0x89, 0x50]))
    const r = run([fixtureRoot])
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('banned filename')
    fs.rmSync(file)
  })

  test('a missing scan root is a scanner error, never a pass', () => {
    const r = run([path.join(fixtureRoot, 'does-not-exist')])
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('scanner error')
  })

  test('bad usage is a scanner error, never a pass', () => {
    const r = run([])
    expect(r.status).not.toBe(0)
  })
})
