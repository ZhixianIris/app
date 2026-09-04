import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FolderClient from './FolderClient'
import { getFolderById } from '@services/folders/folders'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

/** Fetch the folder as the current viewer (forwards their session). Returns null
 * when the folder is private / the viewer has no access (the API denies). */
async function fetchFolderForViewer(folderid: string, access_token?: string) {
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

const FolderPage = () => {
  const params = useParams() as { orgslug: string; folderid: string }
  const { orgslug, folderid } = params
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [folderFound, setFolderFound] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!folderid) return
      // Access gate: a private folder (or one the viewer lacks rights to)
      // returns null — no folder name/contents are rendered.
      const folder = await fetchFolderForViewer(folderid, access_token ?? undefined)
      if (!cancelled) setFolderFound(!!folder)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [folderid, access_token])

  if (folderFound === null) {
    return <PageLoading />
  }

  if (!folderFound) {
    return <NotFound />
  }

  return <FolderClient orgslug={orgslug ?? ''} folderid={folderid ?? ''} />
}

export default FolderPage
