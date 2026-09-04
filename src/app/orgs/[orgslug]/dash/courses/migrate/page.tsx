import { useParams } from 'react-router-dom'
import MigrationClient from './client'

export default function MigrationPage() {
  const { orgslug } = useParams() as { orgslug: string }
  return <MigrationClient orgslug={orgslug ?? ''} />
}
