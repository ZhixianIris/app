import React from 'react'
import { useParams } from 'react-router-dom'
import ClientAdminLayout from './ClientAdminLayout'

function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams() as { orgslug: string }

  return (
    <>
      <ClientAdminLayout
        params={{ orgslug: params.orgslug ?? '' }}>
        {children}
      </ClientAdminLayout>
    </>
  )
}

export default DashboardLayout
