import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCommunity } from '@services/communities/communities'
import { getDiscussion } from '@services/communities/discussions'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import DiscussionPageClient from './discussion'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

const DiscussionPage = () => {
  const params = useParams() as { orgslug: string; communityuuid: string; discussionuuid: string }
  const { orgslug, communityuuid, discussionuuid } = params
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [community, setCommunity] = useState<any>(null)
  const [discussion, setDiscussion] = useState<any>(null)
  const [fetchErrored, setFetchErrored] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug || !communityuuid || !discussionuuid) return
      const communityUuid = `community_${communityuuid}`
      const discussionUuid = `discussion_${discussionuuid}`
      let nextCommunity = null
      let nextDiscussion = null
      let errored = false
      try {
        nextCommunity = await getCommunity(
          communityUuid,
          { revalidate: 120, tags: ['communities'] },
          access_token ? access_token : undefined
        )
      } catch (error) {
        errored = true
        console.error('Failed to fetch community:', error)
      }
      try {
        nextDiscussion = await getDiscussion(
          discussionUuid,
          { revalidate: 120, tags: ['discussions'] },
          access_token ? access_token : undefined
        )
      } catch (error) {
        errored = true
        console.error('Failed to fetch discussion:', error)
      }
      if (cancelled) return
      setCommunity(nextCommunity)
      setDiscussion(nextDiscussion)
      setFetchErrored(errored)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, communityuuid, discussionuuid, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  // Missing or denied-to-anon: 404 so non-public discussions aren't enumerable.
  if ((!community || !discussion) && (!fetchErrored || !access_token)) {
    return <NotFound />
  }

  if (!community || !discussion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">You don't have access</h1>
          <p className="text-gray-400 mt-2">You do not have permission to view this discussion.</p>
        </div>
      </div>
    )
  }

  return (
    <DiscussionPageClient
      discussion={discussion}
      community={community}
      orgslug={orgslug ?? ''}
    />
  )
}

export default DiscussionPage
