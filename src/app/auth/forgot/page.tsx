import { useEffect, useState } from 'react'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import ForgotPasswordClient from './forgot'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'

function getAuthOrgSlug(): string | null {
  try {
    const match = document.cookie.match(/(?:^|; )app_org=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

const ForgotPage = () => {
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
        nextOrg = await getOrganizationContextInfo(orgslug, {
          revalidate: 60,
          tags: ['organizations'],
        })
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

  if (!loaded) {
    return null
  }

  return (
    <ForgotPasswordClient org={org} />
  )
}

export default ForgotPage
