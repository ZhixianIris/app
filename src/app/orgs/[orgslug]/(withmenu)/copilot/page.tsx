import React from 'react'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import Copilot from './copilot'
import { getServerSession } from '@/lib/auth/server'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
const CopilotPage = async (params: any) => {
  const orgslug = (await params.params).orgslug

  return (
    <div>
      <Copilot orgslug={orgslug} />
    </div>
  )
}

export default CopilotPage
