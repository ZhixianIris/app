import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getCommunities } from '@services/communities/communities'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import CommunitiesClient from './communities'
import PageLoading from '@components/Objects/Loaders/PageLoading'

const CommunitiesPage = () => {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [communities, setCommunities] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug) return
      let nextOrgId: number | null = null
      try {
        const org = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        nextOrgId = org.id
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      }
      let nextCommunities: any[] = []
      if (nextOrgId) {
        try {
          nextCommunities = await getCommunities(
            nextOrgId,
            1,
            100,
            { revalidate: 120, tags: ['communities'] },
            access_token ? access_token : undefined
          )
        } catch (error) {
          console.error('Failed to fetch communities:', error)
          nextCommunities = []
        }
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setCommunities(nextCommunities || [])
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  return (
    <CommunitiesClient
      communities={communities || []}
      orgslug={orgslug ?? ''}
      org_id={orgId || 0}
    />
  )
}

export default CommunitiesPage
