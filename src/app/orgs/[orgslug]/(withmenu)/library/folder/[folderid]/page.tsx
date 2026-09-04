import React from 'react'
import FolderClient from './FolderClient'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getFolderById } from '@services/folders/folders'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getOrgSeoConfig, buildPageTitle } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { getServerSession } from '@/lib/auth/server'

type MetadataProps = {
  params: Promise<{ orgslug: string; folderid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/** Fetch the folder as the current viewer (forwards their session). Returns null
 * when the folder is private / the viewer has no access (the API denies). */
async function fetchFolderForViewer(folderid: string) {
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token
  try {
    const folder = await getFolderById(
      `folder_${folderid}`,
      access_token ?? undefined,
      { revalidate: 0, tags: ['folders'] }
    )
    return folder && folder.folder_uuid ? folder : null
  } catch {
    return null
  }
}

const FolderPage = async (props: any) => {
  const params = await props.params
  // Server-side access gate: a private folder (or one the viewer lacks rights
  // to) returns a real 404 — no folder name/contents are rendered or indexed.
  const folder = await fetchFolderForViewer(params.folderid)
  if (!folder) {
    notFound()
  }
  return <FolderClient orgslug={params.orgslug} folderid={params.folderid} />
}

export default FolderPage
