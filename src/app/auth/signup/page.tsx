import { Suspense, useEffect, useState } from 'react'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import SignUpClient from './signup'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'

function getAuthOrgSlug(): string | null {
  try {
    const match = document.cookie.match(/(?:^|; )app_org=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

const SignUp = () => {
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
      // A missing subdomain org is a real 404.
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
      {loaded ? <SignUpClient org={org} /> : <PageLoading />}
    </Suspense>
  )
}

export default SignUp
