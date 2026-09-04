import HomeClient from './home-client'
import { useParams } from 'react-router-dom'

const OrgHomePage = () => {
  const { orgslug } = useParams() as { orgslug: string }
  return <HomeClient orgslug={orgslug ?? ''} />
}

export default OrgHomePage
