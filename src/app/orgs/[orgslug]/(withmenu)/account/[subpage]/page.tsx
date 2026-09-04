import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import AccountClient from '@components/Objects/Account/AccountClient'
import PageLoading from '@components/Objects/Loaders/PageLoading'

const VALID_SUBPAGES = ['general', 'profile', 'security', 'purchases']

const AccountSubPage = () => {
  const params = useParams() as { orgslug: string; subpage: string }
  const orgslug = params.orgslug ?? ''
  const subpage = params.subpage ?? ''
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [org, setOrg] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!access_token || !orgslug) return
      try {
        const orgData = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        if (!cancelled) setOrg(orgData)
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, access_token])

  if (session?.status === 'loading') {
    return <PageLoading />
  }

  if (!access_token) {
    return <Navigate to={`/login?redirect=/account/${subpage}`} replace />
  }

  // Redirect to general if invalid subpage
  if (!VALID_SUBPAGES.includes(subpage)) {
    return <Navigate to="/account/general" replace />
  }

  if (!org) {
    return <PageLoading />
  }

  return (
    <AccountClient
      orgslug={orgslug}
      org_id={org.id}
      subpage={subpage}
    />
  )
}

export default AccountSubPage
