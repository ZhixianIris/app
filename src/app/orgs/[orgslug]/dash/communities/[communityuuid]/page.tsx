import { Navigate, useParams } from 'react-router-dom'

export default function CommunityPage() {
  const { communityuuid } = useParams() as { communityuuid: string }
  return <Navigate to={`/dash/communities/${communityuuid}/general`} replace />
}
