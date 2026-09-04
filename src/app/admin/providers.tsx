import { SessionProvider } from '@components/Contexts/AuthContext'
import AppSessionProvider, { SessionGate } from '@components/Contexts/AppSessionContext'
import React from 'react'

export default function AdminProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AppSessionProvider>
        <SessionGate>
          {children}
        </SessionGate>
      </AppSessionProvider>
    </SessionProvider>
  )
}
