import { getOrganizationContextInfo } from '@services/organizations/orgs'
import React from 'react'
import BoardListClient from './client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function BoardsDashPage(params: any) {
  const orgslug = (await params.params).orgslug
  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  return <BoardListClient org_id={org.id} orgslug={orgslug} />
}

export default BoardsDashPage
