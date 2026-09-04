import { useEffect, useState, type ReactNode } from 'react'
import { getAPIUrl } from '@services/config/config'
import NotFound from '@app/not-found'
import PageLoading from '@components/Objects/Loaders/PageLoading'

// Root org-management hub (create / upgrade / delete orgs, billing, account).
//
// SaaS-only in principle: in oss/ee the billing + org-lifecycle surface does
// not exist. We FAIL OPEN: only 404 when the backend DEFINITIVELY reports a
// non-saas deployment (mode === 'oss' | 'ee'). On a fetch error, non-ok
// response, or missing mode we render the children rather than blocking on a
// flaky lookup.
async function getInstanceMode(): Promise<string | null> {
  try {
    const res = await fetch(`${getAPIUrl()}instance/info`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const info = await res.json()
    return typeof info?.mode === 'string' ? info.mode : null
  } catch {
    return null
  }
}

export default function HubLayout({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getInstanceMode().then((m) => {
      if (!cancelled) setMode(m)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (mode === undefined) {
    return <PageLoading />
  }
  if (mode === 'oss' || mode === 'ee') {
    return <NotFound />
  }
  return <>{children}</>
}
