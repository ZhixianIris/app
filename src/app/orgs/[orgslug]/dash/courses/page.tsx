import { useParams } from 'react-router-dom'
import CoursesHome from './client'

function CoursesPage() {
  const { orgslug } = useParams() as { orgslug: string }
  return <CoursesHome orgslug={orgslug ?? ''} />
}

export default CoursesPage
