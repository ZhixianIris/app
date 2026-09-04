import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getServerSession } from '@/lib/auth/server'
import { getOrgSeoConfig, buildPageTitle, buildBreadcrumbJsonLd } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'
import { JsonLd } from '@components/SEO/JsonLd'
import { getBoards } from '@services/boards/boards'
import BoardsPublicClient from './boards'
import { redirect } from "react-router-dom";

type PageParams = Promise<{
  orgslug: string
}>

export default async function BoardsPage({ params }: { params: PageParams }) {
  const { orgslug } = await params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  // Require authentication to view boards. Browser-relative path only — the
  // proxy adds /orgs/{slug} and rewrites /login → /auth/login; an org-prefixed
  // path would be double-prefixed → 404.
  if (!access_token) {
    redirect('/login?redirect=/boards')
  }

  const org = await getOrganizationContextInfo(orgslug, {
    revalidate: 120,
    tags: ['organizations'],
  })

  let initialBoards: any[] = []
  try {
    if (access_token) {
      initialBoards = await getBoards(org?.id || 0, access_token)
    }
  } catch (error) {
    console.error('Error fetching boards:', error)
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: await getServerCanonicalUrl(orgslug, '/') },
    { name: 'Boards', url: await getServerCanonicalUrl(orgslug, '/boards') },
  ])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <BoardsPublicClient
        orgslug={orgslug}
        org_id={org?.id || 0}
        initialBoards={initialBoards || []}
      />
    </>
  )
}
