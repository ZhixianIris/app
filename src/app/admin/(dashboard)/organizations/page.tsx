import React from 'react'
import OrganizationList from '@components/Admin/OrganizationList'

export default function AdminOrganizationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Organizations</h1>
        <p className="text-white/40 mt-1">
          Manage all organizations across the platform
        </p>
      </div>
      <OrganizationList />
    </div>
  )
}
