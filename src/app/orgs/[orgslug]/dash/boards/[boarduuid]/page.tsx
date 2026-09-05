import { Navigate, useParams } from 'react-router-dom'

function BoardSettingsRedirectPage() {
  const { orgslug, boarduuid } = useParams() as { orgslug: string; boarduuid: string }
  return <Navigate to={`/orgs/${orgslug}/dash/boards/${boarduuid}/general`} replace />
}

export default BoardSettingsRedirectPage
