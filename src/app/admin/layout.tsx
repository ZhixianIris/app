import AdminProviders from './providers'
import React, { useEffect, useState } from 'react'
import { fetchInstanceMode, isSuperadminSurfaceBlocked, type InstanceMode } from '@lib/eeGate'
import EERequiredScreen from '@components/Security/EERequiredScreen'
import PageLoading from '@components/Objects/Loaders/PageLoading'

// The gate is resolved on mount. This layout is what decides whether /admin
// exists. Returning the screen here short-circuits AdminProviders, so OSS
// never bootstraps a session or renders the login form.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mode, setMode] = useState<InstanceMode | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetchInstanceMode().then((m) => {
      if (!cancelled) setMode(m)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (mode === undefined) {
    return <PageLoading />
  }

  if (isSuperadminSurfaceBlocked(mode)) {
    return <EERequiredScreen />
  }

  return <AdminProviders>{children}</AdminProviders>
}
