import { Navigate } from 'react-router-dom'

// Bare /dash/developers → the first section.
export default function DevelopersIndex() {
  return <Navigate to="/dash/developers/api" replace />
}
