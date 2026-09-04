import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getServerSession } from '@/lib/auth/server'
import { getCommunities } from '@services/communities/communities'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import CommunitiesClient from './communities'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
const CommunitiesPage = async (params: any) => {
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token
  const orgslug = (await params.params).orgslug
  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })
  const org_id = org.id

  let communities = []
  try {
    communities = await getCommunities(
      org_id,
      1,
      100,
      { revalidate: 120, tags: ['communities'] },
      access_token ? access_token : undefined
    )
  } catch (error) {
    console.error('Failed to fetch communities:', error)
    communities = []
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Communities', url: await getServerCanonicalUrl(orgslug, '/communities') },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <CommunitiesClient
        communities={communities || []}
        orgslug={orgslug}
        org_id={org_id}
      />
    </>
  )
}

export default CommunitiesPage
