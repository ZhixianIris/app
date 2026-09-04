import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgPodcasts } from '@services/podcasts/podcasts'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import PodcastsDashClient from './client'
import PageLoading from '@components/Objects/Loaders/PageLoading'

function PodcastsDashPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [podcasts, setPodcasts] = useState<any[]>([])
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
      let nextPodcasts: any[] = []
      if (nextOrgId) {
        try {
          nextPodcasts = await getOrgPodcasts(
            orgslug,
            { revalidate: 0, tags: ['podcasts'] },
            access_token ? access_token : undefined,
            true // include_unpublished for dashboard
          )
        } catch (error) {
          console.error('Failed to fetch podcasts:', error)
          nextPodcasts = []
        }
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setPodcasts(nextPodcasts || [])
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
    <PodcastsDashClient
      org_id={orgId || 0}
      orgslug={orgslug ?? ''}
      podcasts={podcasts || []}
    />
  )
}

export default PodcastsDashPage
