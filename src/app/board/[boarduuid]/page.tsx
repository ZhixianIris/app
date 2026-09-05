import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import BoardCanvasClient from './client'
import PageLoading from '@components/Objects/Loaders/PageLoading'

function BoardEditorPage() {
  const { boarduuid } = useParams() as { boarduuid: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [orgslug, setOrgslug] = useState('')

  useEffect(() => {
    // The active org slug rides in a cookie set at login.
    try {
      const match = document.cookie.match(/(?:^|; )app_org=([^;]*)/)
      setOrgslug(match ? decodeURIComponent(match[1]) : '')
    } catch {
      setOrgslug('')
    }
  }, [])

  if (session?.status === 'loading') {
    return <PageLoading />
  }

  // Redirect ONLY when there is no session at all. A session the client could
  // not resolve (`unresolved`: refresh cookie present, access token expired)
  // belongs to a signed-in user — bouncing them to /login here would sign
  // people out just for coming back after their 8-hour access token lapsed.
  // The client picks up the real token from the session context instead.
  if (!session) {
    return <Navigate to={`/auth/login?redirect=/board/${boarduuid}`} replace />
  }

  // Ensure board_uuid has the board_ prefix for the API
  const boardUuid = (boarduuid ?? '').startsWith('board_')
    ? boarduuid
    : `board_${boarduuid}`

  return (
    <BoardCanvasClient
      boardUuid={boardUuid ?? ''}
      accessToken={access_token}
      orgslug={orgslug}
      username={session?.data?.user?.username || session?.data?.user?.email || ''}
    />
  )
}

export default BoardEditorPage
