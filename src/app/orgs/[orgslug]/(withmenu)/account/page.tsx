import { Navigate, useParams } from 'react-router-dom'

const AccountPage = () => {
  const { orgslug } = useParams<{ orgslug: string }>()
  return <Navigate to={`/orgs/${orgslug}/account/general`} replace />
}

export default AccountPage
