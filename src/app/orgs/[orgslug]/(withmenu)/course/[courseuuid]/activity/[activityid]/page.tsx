import { useParams } from 'react-router-dom'
import ActivityClient from './activity'

const ActivityPage = () => {
  const params = useParams() as { orgslug: string; courseuuid: string; activityid: string }
  const { activityid, courseuuid, orgslug } = params

  return (
    <ActivityClient
      activityid={activityid ?? ''}
      courseuuid={courseuuid ?? ''}
      orgslug={orgslug ?? ''}
      activity={null}
      course={null}
    />
  )
}

export default ActivityPage
