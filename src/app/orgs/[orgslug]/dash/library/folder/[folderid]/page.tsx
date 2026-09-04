import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getFolderById } from '@services/folders/folders'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import FolderView from './client'
import PageLoading from '@components/Objects/Loaders/PageLoading'

function FolderPage() {
  const { orgslug, folderid } = useParams() as { orgslug: string; folderid: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [folder, setFolder] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug || !folderid) return
      let nextOrgId: number | null = null
      try {
        const org = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        nextOrgId = org.id
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      }
      let nextFolder: any = null
      if (nextOrgId) {
        try {
          nextFolder = await getFolderById('folder_' + folderid, access_token ?? undefined, { revalidate: 0, tags: ['folders'] })
        } catch (error) {
          console.error('Failed to fetch folder:', error)
          nextFolder = null
        }
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setFolder(nextFolder)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, folderid, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  return (
    <FolderView
      orgslug={orgslug ?? ''}
      org_id={orgId || 0}
      folderid={folderid ?? ''}
      initialFolder={folder}
    />
  )
}

export default FolderPage
