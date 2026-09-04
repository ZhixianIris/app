import { getOrgPodcasts } from '@services/podcasts/podcasts'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getServerSession } from '@/lib/auth/server'
import { getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import PodcastsClient from './podcasts'

type PageParams = Promise<{
  orgslug: string
}>

export default async function PodcastsPage({ params }: { params: PageParams }) {
  const { orgslug } = await params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  let initialPodcasts = []
  try {
    initialPodcasts = await getOrgPodcasts(
      orgslug,
      { revalidate: 120, tags: ['podcasts'] },
      access_token ? access_token : undefined,
      access_token ? true : false  // include_unpublished for logged-in users
    )
  } catch (error) {
    console.error('Error fetching podcasts:', error)
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Podcasts', url: await getServerCanonicalUrl(orgslug, '/podcasts') },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PodcastsClient
        orgslug={orgslug}
        org_id={org?.id || 0}
        initialPodcasts={initialPodcasts || []}
      />
    </>
  )
}
