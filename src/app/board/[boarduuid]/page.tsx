import React from 'react'
import { cookies } from 'next/headers'
import { getServerSession } from '@/lib/auth/server'
import BoardCanvasClient from './client'
import { redirect } from "react-router-dom";

type MetadataProps = {
  params: Promise<{ boarduuid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function BoardEditorPage(props: any) {
  const params = await props.params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token
  const cookieStore = await cookies()
  const orgslug = cookieStore.get('LH_org')?.value || ''

  // Require authentication to access board canvas. Bare /login only — the proxy
  // rewrites it to /auth/login with tenant context; an /orgs/{slug}/login path
  // isn't a real route (the /orgs prefix is an internal rewrite target) → 404.
  //
  // Redirect ONLY when there is no session at all. A session the server could
  // not resolve (`unresolved`: refresh cookie present, access token expired)
  // belongs to a signed-in user — bouncing them to /login here was signing
  // people out just for coming back after their 8-hour access token lapsed.
  // The client picks up the real token from the session context instead.
  if (!session) {
    redirect(`/login?redirect=/board/${params.boarduuid}`)
  }

  // Ensure board_uuid has the board_ prefix for the API
  const boardUuid = params.boarduuid.startsWith('board_')
    ? params.boarduuid
    : `board_${params.boarduuid}`

  return (
    <BoardCanvasClient
      boardUuid={boardUuid}
      accessToken={access_token}
      orgslug={orgslug}
      username={session?.user?.username || session?.user?.email || ''}
    />
  )
}

export default BoardEditorPage
