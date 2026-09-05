#!/usr/bin/env node
/**
 * Demo server for local exploration of the built SPA.
 *
 * One origin, two jobs:
 *   1. serves the production bundle in ./dist (SPA fallback to index.html)
 *   2. answers the /api/auth/* and /api/v1/* endpoints the app calls, with a
 *      demo organization, two demo courses and a demo user.
 *
 * Any email + password combination logs in (default: demo@example.com / demo1234).
 * This is a demo convenience only — it is not part of the app and is never
 * deployed.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT || 4173)

const ACTION = (create = true) => ({
  action_create: create, action_read: true, action_read_own: true,
  action_update: true, action_update_own: true, action_delete: true, action_delete_own: true,
})

const DEMO_RIGHTS = {
  dashboard: { action_access: true },
  organizations: { action_update: true, action_read: true },
  courses: ACTION(),
  users: ACTION(),
  usergroups: ACTION(),
  folders: ACTION(),
  media: ACTION(),
  communities: ACTION(),
  podcasts: ACTION(),
  playgrounds: ACTION(),
  roles: ACTION(),
  assignments: ACTION(),
}

const DEMO_USER = {
  user_uuid: 'user_demo_0001',
  email: 'demo@example.com',
  username: 'demo',
  first_name: 'Demo',
  last_name: 'User',
}

const DEMO_ORG = {
  id: 1,
  org_uuid: 'org_demo_0001',
  org_name: 'Demo Organization',
  name: 'Demo Organization',
  slug: 'demo',
  org_slug: 'demo',
  logo_image: null,
  config: {
    config: {
      features: { payments: { enabled: false } },
      resolved_features: { payments: { enabled: false } },
      customization: { general: { color: '', footer_text: '' } },
    },
  },
}

const DEMO_COURSES = [
  {
    course_uuid: 'course_demo_0001',
    name: 'Getting Started',
    description: 'A short onboarding course for the demo organization.',
    thumbnail_image: null,
    public: true,
  },
  {
    course_uuid: 'course_demo_0002',
    name: 'Deep Dive: The Feature Tour',
    description: 'A longer walkthrough with chapters and activities.',
    thumbnail_image: null,
    public: true,
  },
]

const ACCESS_TOKEN = 'demo-access-token'
const EXPIRY = Date.now() + 8 * 60 * 60 * 1000

const json = (res, code, body, cookies = []) => {
  if (cookies.length > 0) res.setHeader('Set-Cookie', cookies)
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

const sessionCookie = () => `app_session=demo; Path=/; SameSite=Lax`
const authCookies = () => [
  `app_access=${ACCESS_TOKEN}; Path=/; SameSite=Lax`,
  `app_refresh=demo-refresh; Path=/; SameSite=Lax`,
]

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.map': 'application/json', '.webp': 'image/webp',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const p = url.pathname

  // ---------------- auth (same-origin /api/auth/*, as the app calls it) ----
  if (p === '/api/auth/login' && req.method === 'POST') {
    return json(res, 200, {
      tokens: { access_token: ACCESS_TOKEN, refresh_token: 'demo-refresh', expiry: EXPIRY },
      user: DEMO_USER,
    }, [sessionCookie(), ...authCookies()])
  }
  if (p === '/api/auth/refresh' && req.method === 'GET') {
    return json(res, 200, { access_token: ACCESS_TOKEN, expiry: EXPIRY }, [sessionCookie(), ...authCookies()])
  }
  if (p === '/api/auth/logout' && req.method === 'POST') {
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
    return json(res, 200, { ok: true }, [
      `app_session=; Path=/; ${expired}`,
      `app_access=; Path=/; ${expired}`,
      `app_refresh=; Path=/; ${expired}`,
    ])
  }

  // ---------------- instance / org / course endpoints (/api/v1/*) ----------
  if (p === '/api/v1/instance/info') {
    return json(res, 200, { mode: 'oss', version: 'demo' })
  }
  if (p === '/api/v1/users/session') {
    return json(res, 200, { user: DEMO_USER, roles: [{ role_id: 'role_demo_instructor', name: 'Instructor', org: { id: 1, org_uuid: 'org_demo_0001', slug: 'demo', name: 'Demo Organization' }, role: { rights: DEMO_RIGHTS } }] })
  }
  if (p === '/api/v1/orgs/user/page/1/limit/50') {
    return json(res, 200, [DEMO_ORG])
  }
  if (p.match(/^\/api\/v1\/orgs\/slug\/[^/]+$/)) {
    return json(res, 200, DEMO_ORG)
  }
  if (p.match(/^\/api\/v1\/courses\/org_slug\/[^/]+\/page\/\d+\/limit\/\d+/)) {
    return json(res, 200, DEMO_COURSES)
  }
  if (p.match(/^\/api\/v1\/courses\/course_/) && p.endsWith('/meta')) {
    const course = DEMO_COURSES[0]
    return json(res, 200, { ...course, chapters: [], seo: {} })
  }
  if (p === '/api/v1/users/me' || p === '/api/v1/users/profile') {
    return json(res, 200, DEMO_USER)
  }

  // Permissive fallback for the long tail of org-content endpoints: pages
  // render their empty states instead of erroring during a click-through.
  if (p.startsWith('/api/v1/')) {
    return json(res, 200, Array.isArray(p.match(/s\/?$/) ? [] : undefined) ? [] : {})
  }

  // ---------------- static dist --------------------------------------------
  let filePath = path.join(DIST, decodeURIComponent(p))
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403); return res.end()
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html') // SPA fallback
  }
  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
  })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => {
  console.log(`demo server on http://localhost:${PORT}  (login: demo@example.com / demo1234 — any credentials work)`)
})
