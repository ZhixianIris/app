import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PlaygroundsClient from './playgrounds'
import { getOrgPlaygrounds } from '@services/playgrounds/playgrounds'
import PageLoading from '@components/Objects/Loaders/PageLoading'

export default function PlaygroundsPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgId, setOrgId] = useState<number | null>(null)
  const [initialPlaygrounds, setInitialPlaygrounds] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug) return
      let nextOrgId: number | null = null
      let playgrounds: any[] = []
      try {
        const org = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        nextOrgId = org?.id || 0
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
      try {
        if (nextOrgId) {
          playgrounds = await getOrgPlaygrounds(nextOrgId, access_token ?? undefined)
        }
      } catch (error) {
        console.error('Error fetching playgrounds:', error)
      }
      if (cancelled) return
      setOrgId(nextOrgId)
      setInitialPlaygrounds(playgrounds)
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
    <PlaygroundsClient
      orgslug={orgslug ?? ''}
      org_id={orgId || 0}
      initialPlaygrounds={initialPlaygrounds}
    />
  )
}
