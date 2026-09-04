import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPodcastMeta, PodcastMeta } from '@services/podcasts/podcasts'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PodcastClient from './podcast'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

export default function PodcastPage() {
  const { orgslug, podcastuuid } = useParams() as { orgslug: string; podcastuuid: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [org, setOrg] = useState<any>(null)
  const [podcastMeta, setPodcastMeta] = useState<PodcastMeta | null>(null)
  const [fetchError, setFetchError] = useState<{ status?: number } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug || !podcastuuid) return
      let nextOrg: any = null
      try {
        nextOrg = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
      let nextMeta: PodcastMeta | null = null
      let nextError: { status?: number } | null = null
      try {
        nextMeta = await getPodcastMeta(
          `podcast_${podcastuuid}`,
          { revalidate: 120, tags: ['podcasts'] },
          access_token
        )
      } catch (error: any) {
        nextError = { status: error?.status }
        console.error('Error fetching podcast:', error)
      }
      if (cancelled) return
      setOrg(nextOrg)
      setPodcastMeta(nextMeta)
      setFetchError(nextError)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, podcastuuid, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  // Missing, or denied-to-anon: 404 so non-public podcasts aren't enumerable.
  if (!podcastMeta && (!fetchError || !access_token)) {
    return <NotFound />
  }

  if (!podcastMeta) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">You do not have permission to view this podcast.</p>
      </div>
    )
  }

  return (
    <PodcastClient
      orgslug={orgslug ?? ''}
      org_id={org?.id || 0}
      podcastUuid={`podcast_${podcastuuid}`}
      initialPodcast={podcastMeta.podcast}
      initialEpisodes={podcastMeta.episodes}
    />
  )
}
