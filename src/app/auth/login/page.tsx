import { useEffect, useState } from 'react'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import LoginClient from './login'
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

const Login = () => {
  const [org, setOrg] = useState<any>(null)
  const [orgMissing, setOrgMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const orgslug = getAuthOrgSlug()
      if (!orgslug) return
      let nextOrg: any = null
      try {
        nextOrg = await getOrganizationContextInfo(orgslug, {
          revalidate: 60,
          tags: ['organizations'],
        })
      } catch {
        nextOrg = null
      }
      if (cancelled) return
      // A subdomain (or single-tenancy) slug that can't be resolved is a real error.
      if (!nextOrg) {
        setOrgMissing(true)
        return
      }
      setOrg(nextOrg)
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
    <div>
      <LoginClient org={org}></LoginClient>
    </div>
  )
}

export default Login
