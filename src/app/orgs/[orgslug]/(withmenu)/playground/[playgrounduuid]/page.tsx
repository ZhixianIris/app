import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayground } from '@services/playgrounds/playgrounds'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PlaygroundViewClient from './view'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

export default function PlaygroundViewPage() {
  const { orgslug, playgrounduuid } = useParams() as { orgslug: string; playgrounduuid: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [playground, setPlayground] = useState<any>(null)
  const [missing, setMissing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!playgrounduuid) return
      let next: any = null
      let isMissing = false
      try {
        next = await getPlayground(playgrounduuid, access_token ?? undefined)
      } catch {
        isMissing = true
      }
      if (!isMissing && next && !next.published && !access_token) {
        isMissing = true
      }
      if (cancelled) return
      setPlayground(next)
      setMissing(isMissing)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [playgrounduuid, access_token])

  if (!loaded) {
    return <PageLoading />
  }

  if (missing) {
    return <NotFound />
  }

  return (
    <PlaygroundViewClient
      playground={playground}
      orgslug={orgslug ?? ''}
      canEdit={!!access_token}
    />
  )
}
