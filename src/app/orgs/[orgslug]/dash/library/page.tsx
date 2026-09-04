import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgFolders } from '@services/folders/folders'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import LibraryHome from './client'
import PageLoading from '@components/Objects/Loaders/PageLoading'

function LibraryPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [folders, setFolders] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug) return
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
      let nextFolders: any[] = []
      if (nextOrgId) {
        try {
          nextFolders = await getOrgFolders(nextOrgId, access_token ?? undefined, { revalidate: 60, tags: ['folders'] })
        } catch (error) {
          // Folders are a transparent, optional layer: degrade to an empty state
          // instead of blanking the page if the API call fails.
          console.warn('Failed to fetch folders, falling back to empty state:', error)
          nextFolders = []
        }
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setFolders(nextFolders || [])
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  return <LibraryHome orgslug={orgslug ?? ''} org_id={orgId || 0} initialFolders={folders || []} />
}

export default LibraryPage
