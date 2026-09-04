import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import BoardsHome from './client'

function BoardsPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const [orgId, setOrgId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug) return
      try {
        const org = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        if (!cancelled) setOrgId(org?.id ?? null)
      } catch (error) {
        console.error('Failed to fetch organization:', error)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug])

  return <BoardsHome orgslug={orgslug ?? ''} org_id={orgId ?? 0} />
}

export default BoardsPage
