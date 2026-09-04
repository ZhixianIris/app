import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrgPodcasts } from '@services/podcasts/podcasts'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import PodcastsClient from './podcasts'
import PageLoading from '@components/Objects/Loaders/PageLoading'

export default function PodcastsPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [initialPodcasts, setInitialPodcasts] = useState<any[]>([])
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
        nextOrgId = org?.id || 0
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
      let podcasts: any[] = []
      try {
        podcasts = await getOrgPodcasts(
          orgslug,
          { revalidate: 120, tags: ['podcasts'] },
          access_token ? access_token : undefined,
          access_token ? true : false  // include_unpublished for logged-in users
        )
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setInitialPodcasts(podcasts || [])
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

  return (
    <PodcastsClient
      orgslug={orgslug ?? ''}
      org_id={orgId || 0}
      initialPodcasts={initialPodcasts || []}
    />
  )
}
