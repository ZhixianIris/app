import { getOrganizationContextInfo } from '@services/organizations/orgs'
import React from 'react'
import { getServerSession } from '@/lib/auth/server'
import { getCommunities } from '@services/communities/communities'
import CommunitiesDashClient from './client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function CommunitiesDashPage(params: any) {
  const orgslug = (await params.params).orgslug
  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  let communities = []
  try {
    communities = await getCommunities(
      org.id,
      1,
      100,
      { revalidate: 0, tags: ['communities'] },
      access_token ? access_token : undefined
    )
  } catch (error) {
    console.error('Failed to fetch communities:', error)
    communities = []
  }

  return (
    <CommunitiesDashClient
      org_id={org.id}
      orgslug={orgslug}
      communities={communities || []}
    />
  )
}

export default CommunitiesDashPage
