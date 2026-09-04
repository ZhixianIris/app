import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import { getBoards } from '@services/boards/boards'
import BoardsPublicClient from './boards'
import PageLoading from '@components/Objects/Loaders/PageLoading'

export default function BoardsPage() {
  const { orgslug } = useParams() as { orgslug: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [org, setOrg] = useState<any>(null)
  const [initialBoards, setInitialBoards] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!access_token || !orgslug) return
      try {
        const orgData = await getOrganizationContextInfo(orgslug, {
          revalidate: 120,
          tags: ['organizations'],
        })
        let boards: any[] = []
        try {
          if (access_token) {
            boards = await getBoards(orgData?.id || 0, access_token)
          }
        } catch (error) {
          console.error('Error fetching boards:', error)
        }
        if (!cancelled) {
          setOrg(orgData)
          setInitialBoards(boards || [])
          setLoaded(true)
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
        if (!cancelled) setLoaded(true)
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

  // Require authentication to view boards.
  if (!access_token) {
    return <Navigate to="/login?redirect=/boards" replace />
  }

  if (!loaded) {
    return <PageLoading />
  }

  return (
    <BoardsPublicClient
      orgslug={orgslug ?? ''}
      org_id={org?.id || 0}
      initialBoards={initialBoards || []}
    />
  )
}
