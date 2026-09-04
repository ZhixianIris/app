import { useSearchParams, useParams } from 'react-router-dom'
import EmbedActivityClient from './EmbedActivityClient'

const HEX_COLOR_RE = /^[0-9a-fA-F]{3,8}$/

function sanitizeBgColor(raw: string | null): string | null {
  if (!raw) return null
  return HEX_COLOR_RE.test(raw) ? `#${raw}` : null
}

export default function EmbedActivityPage() {
  const { orgslug, courseuuid, activityid } = useParams() as { orgslug: string; courseuuid: string; activityid: string }
  const [searchParams] = useSearchParams()
  const bgcolor = sanitizeBgColor(searchParams.get('bgcolor'))

  return (
    <>
      {bgcolor && <style>{`html,body{background-color:${bgcolor}!important}`}</style>}
      <EmbedActivityClient
        activityId={activityid ?? ''}
        courseuuid={courseuuid ?? ''}
        orgslug={orgslug ?? ''}
        bgcolor={bgcolor}
      />
    </>
  )
}
