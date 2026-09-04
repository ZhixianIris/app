import { Navigate } from 'react-router-dom'

const AccountPage = () => {
  // Browser-relative path (no org slug / no /orgs prefix): the SPA keeps every
  // route on the current origin, so a plain relative redirect is correct.
  return <Navigate to="/account/general" replace />
}

export default AccountPage
