import { getOrganizationContextInfo } from '@services/organizations/orgs'
import React from 'react'
import PlaygroundsListClient from './client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function PlaygroundsDashPage(params: any) {
  const orgslug = (await params.params).orgslug
  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  return <PlaygroundsListClient org_id={org.id} orgslug={orgslug} />
}

export default PlaygroundsDashPage
