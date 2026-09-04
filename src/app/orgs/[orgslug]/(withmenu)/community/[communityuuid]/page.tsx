import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getServerSession } from '@/lib/auth/server'
import { getCommunity } from '@services/communities/communities'
import { getDiscussions, DiscussionWithAuthor } from '@services/communities/discussions'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getCanonicalUrl, getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import CommunityClient from './community'

type MetadataProps = {
  params: Promise<{ orgslug: string; communityuuid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
const CommunityPage = async (params: any) => {
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token
  const { orgslug, communityuuid } = await params.params
  const communityUuid = `community_${communityuuid}`

  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })
  const org_id = org.id

  let community = null
  let communityError: { status?: number } | null = null
  let discussions: DiscussionWithAuthor[] = []

  try {
    community = await getCommunity(
      communityUuid,
      { revalidate: 120, tags: ['communities'] },
      access_token ? access_token : undefined
    )
  } catch (error: any) {
    communityError = { status: error?.status }
    console.error('Failed to fetch community:', error)
  }

  if (community) {
    try {
      discussions = await getDiscussions(
        communityUuid,
        'recent',
        1,
        10,
        { revalidate: 120, tags: ['discussions'] },
        access_token ? access_token : undefined
      )
    } catch (error) {
      console.error('Failed to fetch discussions:', error)
      discussions = []
    }
  }

  // Missing, or denied-to-anon: 404 so non-public communities aren't enumerable.
  if (!community && (!communityError || !access_token)) {
    notFound()
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">You don't have access</h1>
          <p className="text-gray-400 mt-2">You do not have permission to view this community.</p>
        </div>
      </div>
    )
  }

  const communityJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: community.name,
    description: community.description,
    author: {
      '@type': 'Organization',
      name: org.name,
    },
    url: await getServerCanonicalUrl(orgslug, `/community/${communityuuid}`),
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Communities', url: await getServerCanonicalUrl(orgslug, '/communities') },
    { name: community.name || 'Community', url: await getServerCanonicalUrl(orgslug, `/community/${communityuuid}`) },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={communityJsonLd} />
      <CommunityClient
        community={community}
        initialDiscussions={discussions || []}
        orgslug={orgslug}
        org_id={org_id}
      />
    </>
  )
}

export default CommunityPage
