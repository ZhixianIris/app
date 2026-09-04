import { getOrganizationContextInfo } from '@services/organizations/orgs'
import React from 'react'
import { getServerSession } from '@/lib/auth/server'
import { getOrgFolders } from '@services/folders/folders'
import LibraryHome from './client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function LibraryPage(props: { params: Promise<{ orgslug: string }> }) {
  const { orgslug } = await props.params
  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  let folders: any[] = []
  try {
    folders = await getOrgFolders(org.id, access_token ?? undefined, { revalidate: 60, tags: ['folders'] })
  } catch (error) {
    // Folders are a transparent, optional layer: degrade to an empty state
    // instead of blanking the page if the API call fails.
    console.warn('Failed to fetch folders, falling back to empty state:', error)
    folders = []
  }

  return <LibraryHome orgslug={orgslug} org_id={org.id} initialFolders={folders || []} />
}

export default LibraryPage
