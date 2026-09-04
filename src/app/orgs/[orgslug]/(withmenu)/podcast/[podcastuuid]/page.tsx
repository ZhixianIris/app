import { getPodcastMeta, PodcastMeta } from '@services/podcasts/podcasts'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getPodcastThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getServerSession } from '@/lib/auth/server'
import { getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import PodcastClient from './podcast'

type PageParams = Promise<{
  orgslug: string
  podcastuuid: string
}>

export default async function PodcastPage({ params }: { params: PageParams }) {
  const { orgslug, podcastuuid } = await params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  let podcastMeta: PodcastMeta | null = null
  let fetchError: { status?: number } | null = null
  try {
    podcastMeta = await getPodcastMeta(
      `podcast_${podcastuuid}`,
      { revalidate: 120, tags: ['podcasts'] },
      access_token
    )
  } catch (error: any) {
    fetchError = { status: error?.status }
    console.error('Error fetching podcast:', error)
  }

  // Missing, or denied-to-anon: 404 so non-public podcasts aren't enumerable.
  if (!podcastMeta && (!fetchError || !access_token)) {
    notFound()
  }

  if (!podcastMeta) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">You do not have permission to view this podcast.</p>
      </div>
    )
  }

  const podcastJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: podcastMeta.podcast.name,
    description: podcastMeta.podcast.description,
    url: await getServerCanonicalUrl(orgslug, `/podcast/${podcastuuid}`),
    provider: {
      '@type': 'Organization',
      name: org?.name,
    },
    episode: (podcastMeta.episodes || []).map((ep: any) => ({
      '@type': 'PodcastEpisode',
      name: ep.name,
      description: ep.description,
    })),
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Podcasts', url: await getServerCanonicalUrl(orgslug, '/podcasts') },
    { name: podcastMeta.podcast.name, url: await getServerCanonicalUrl(orgslug, `/podcast/${podcastuuid}`) },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={podcastJsonLd} />
      <PodcastClient
        orgslug={orgslug}
        org_id={org?.id || 0}
        podcastUuid={`podcast_${podcastuuid}`}
        initialPodcast={podcastMeta.podcast}
        initialEpisodes={podcastMeta.episodes}
      />
    </>
  )
}
