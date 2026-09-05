#!/usr/bin/env node
/**
 * Ban scanner for the learning-web repo. Pure Node — no ripgrep, no deps.
 *
 * Usage:
 *   node scripts/check-bans.mjs [--dist] <path> [<path> ...]
 *
 *   --dist  scan a production build output (brand text + Radix code only)
 *
 * Exit codes:
 *   0  clean (no banned content found)
 *   1  banned content found
 *   2  scanner error (missing path, unreadable file, bad usage) — never a pass
 *
 * Rule literals are assembled from fragments on purpose: this file lives in
 * scripts/, which is itself one of the scanned roots.
 */
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const distMode = args.includes('--dist')
const roots = args.filter((a) => a !== '--dist')

if (roots.length === 0) {
  console.error('usage: node scripts/check-bans.mjs [--dist] <path> [...]')
  process.exit(2)
}

// --- rule assembly (fragment-joined so this file never self-matches) -------
const J = (...parts) => parts.join('')
const R = (...parts) => new RegExp(J(...parts), 'i')

const brandWords = [
  R(J('learn'), J('[ _-]?'), J('house')), // product name, all spellings
  R(J('learnhouse'), J('\\.(app|io)')),
]

const sourceRules = [
  ...brandWords.map((re) => ({ re, label: 'brand word' })),
  { re: R(J('LH'), J('_')), label: 'brand cookie/storage prefix' },
  { re: R(J('\\blh'), J('[-_]')), label: 'brand abbreviation prefix' },
  { re: R(J('X-'), J('[lL][hH]'), J('-')), label: 'brand request header' },
  { re: /asChild/, label: 'Radix asChild API' },
  { re: R(J('data-\\['), J('state=')), label: 'Radix state attribute selector' },
  { re: R(J('--'), J('radix-')), label: 'Radix CSS variable' },
  { re: R(J('@'), J('radix-ui'), J('/')), label: 'Radix import' },
  { re: /from\s+["']next\//, label: 'Next.js import' },
]

// Node-side rules only make sense for browser code (src/); Node utility
// scripts legitimately use process.env/require.
const srcOnlyRules = [
  { re: /\bprocess\.env\b/, label: 'Node env access in browser code' },
  { re: /\brequire\(/, label: 'CommonJS require in browser code' },
]

const distRules = [
  ...brandWords.map((re) => ({ re, label: 'brand word' })),
  { re: R(J('@'), J('radix-ui')), label: 'Radix code in bundle' },
]

const bannedFilename = R(J('learn'), J('house'))

// --- file selection ---------------------------------------------------------
const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.json', '.css', '.html',
  '.svg', '.md', '.yaml', '.yml', '.txt', '.map',
])
const BINARY_SKIP = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf'])

const SELF = path.resolve(fs.realpathSync(process.argv[1]))

function* walk(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (err) {
    console.error(`scanner error: cannot read ${dir}: ${err.message}`)
    process.exit(2)
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      yield* walk(full)
    } else {
      yield full
    }
  }
}

// --- scan ------------------------------------------------------------------
const violations = []

for (const root of roots) {
  if (!fs.existsSync(root)) {
    console.error(`scanner error: path does not exist: ${root}`)
    process.exit(2)
  }
}

for (const root of roots) {
  const stat = fs.statSync(root)
  const files = stat.isFile() ? [root] : [...walk(root)]
  for (const file of files) {
    if (path.resolve(file) === SELF) continue
    const ext = path.extname(file).toLowerCase()
    const base = path.basename(file)

    if (bannedFilename.test(base)) {
      violations.push(`${file}: banned filename`)
    }

    if (BINARY_SKIP.has(ext)) continue
    if (ext && !TEXT_EXT.has(ext) && distMode) continue

    let content
    try {
      content = fs.readFileSync(file, 'utf8')
    } catch (err) {
      console.error(`scanner error: cannot read ${file}: ${err.message}`)
      process.exit(2)
    }

    const rules = distMode
      ? distRules
      : file.includes(`${path.sep}src${path.sep}`)
        ? [...sourceRules, ...srcOnlyRules]
        : sourceRules
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const rule of rules) {
        if (rule.re.test(lines[i])) {
          violations.push(`${file}:${i + 1}: ${rule.label}`)
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`BANNED CONTENT FOUND (${violations.length}):`)
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
}

console.log(`clean (${distMode ? 'dist' : 'source'} scan over ${roots.join(', ')})`)
