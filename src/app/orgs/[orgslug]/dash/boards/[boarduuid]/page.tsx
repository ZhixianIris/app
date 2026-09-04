import { Navigate, useParams } from 'react-router-dom'

function BoardSettingsRedirectPage() {
  const { boarduuid } = useParams() as { boarduuid: string }
  return <Navigate to={`/dash/boards/${boarduuid}/general`} replace />
}

export default BoardSettingsRedirectPage
