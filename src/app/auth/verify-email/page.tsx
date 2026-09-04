import { Suspense, useEffect, useState } from 'react'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import VerifyEmailClient from './verify-email'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'
import PageLoading from '@components/Objects/Loaders/PageLoading'

function getAuthOrgSlug(): string | null {
  try {
    const match = document.cookie.match(/(?:^|; )app_org=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

const VerifyEmailPage = () => {
  const [org, setOrg] = useState<any>(null)
  const [orgMissing, setOrgMissing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const orgslug = getAuthOrgSlug()
      if (!orgslug) {
        if (!cancelled) setLoaded(true)
        return
      }
      let nextOrg: any = null
      try {
        nextOrg = await getOrganizationContextInfo(orgslug, null)
      } catch {
        nextOrg = null
      }
      if (cancelled) return
      if (!nextOrg) {
        setOrgMissing(true)
        return
      }
      setOrg(nextOrg)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (orgMissing) {
    return <OrgNotFound />
  }

  return (
    <Suspense fallback={<PageLoading />}>
      {loaded ? <VerifyEmailClient org={org} /> : <PageLoading />}
    </Suspense>
  )
}

export default VerifyEmailPage
