import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCommunity } from '@services/communities/communities'
import { getDiscussions, DiscussionWithAuthor } from '@services/communities/discussions'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import CommunityClient from './community'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

const CommunityPage = () => {
  const params = useParams() as { orgslug: string; communityuuid: string }
  const { orgslug, communityuuid } = params
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const communityUuid = `community_${communityuuid}`

  const [community, setCommunity] = useState<any>(null)
  const [communityError, setCommunityError] = useState<{ status?: number } | null>(null)
  const [discussions, setDiscussions] = useState<DiscussionWithAuthor[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!communityUuid) return
      let nextCommunity = null
      let nextError: { status?: number } | null = null
      let nextDiscussions: DiscussionWithAuthor[] = []
      try {
        nextCommunity = await getCommunity(
          communityUuid,
          { revalidate: 120, tags: ['communities'] },
          access_token ? access_token : undefined
        )
      } catch (error: any) {
        nextError = { status: error?.status }
        console.error('Failed to fetch community:', error)
      }
      if (nextCommunity) {
        try {
          nextDiscussions = await getDiscussions(
            communityUuid,
            'recent',
            1,
            10,
            { revalidate: 120, tags: ['discussions'] },
            access_token ? access_token : undefined
          )
        } catch (error) {
          console.error('Failed to fetch discussions:', error)
          nextDiscussions = []
        }
      }
      if (cancelled) return
      setCommunity(nextCommunity)
      setCommunityError(nextError)
      setDiscussions(nextDiscussions)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [communityUuid, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  // Missing, or denied-to-anon: 404 so non-public communities aren't enumerable.
  if (!community && (!communityError || !access_token)) {
    return <NotFound />
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">You don't have access</h1>
          <p className="text-gray-400 mt-2">You do not have permission to view this community.</p>
        </div>
      </div>
    )
  }

  return (
    <CommunityClient
      community={community}
      initialDiscussions={discussions || []}
      orgslug={orgslug ?? ''}
      org_id={community.org_id}
    />
  )
}

export default CommunityPage
