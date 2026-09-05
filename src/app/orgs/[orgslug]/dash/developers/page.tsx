import { Navigate, useParams } from 'react-router-dom'

// Bare /dash/developers → the first section.
export default function DevelopersIndex() {
  const { orgslug } = useParams<{ orgslug: string }>()
  return <Navigate to={`/orgs/${orgslug}/dash/developers/api`} replace />
}
