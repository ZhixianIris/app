import { Navigate, useParams } from 'react-router-dom'

export default function CommunityPage() {
  const { orgslug, communityuuid } = useParams() as { orgslug: string; communityuuid: string }
  return <Navigate to={`/orgs/${orgslug}/dash/communities/${communityuuid}/general`} replace />
}
