import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getPlayground } from '@services/playgrounds/playgrounds'
import { getOrgCourses } from '@services/courses/courses'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PlaygroundEditor from '@components/Playground/PlaygroundEditor'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import NotFound from '@app/not-found'

export default function EditPlaygroundPage() {
  const { playgrounduuid } = useParams() as { playgrounduuid: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [playground, setPlayground] = useState<any>(null)
  const [orgCourses, setOrgCourses] = useState<{ course_uuid: string; name: string }[]>([])
  const [missing, setMissing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!access_token || !playgrounduuid) return
      let next: any = null
      let isMissing = false
      try {
        next = await getPlayground(playgrounduuid, access_token)
      } catch {
        isMissing = true
      }
      let nextCourses: { course_uuid: string; name: string }[] = []
      if (next?.org_slug) {
        try {
          const coursesRes = await getOrgCourses(next.org_slug, null, access_token, true)
          nextCourses = (Array.isArray(coursesRes) ? coursesRes : []).map((c: any) => ({
            course_uuid: c.course_uuid,
            name: c.name,
          }))
        } catch {
          // Non-fatal — proceed without course context
        }
      }
      if (cancelled) return
      setPlayground(next)
      setMissing(isMissing)
      setOrgCourses(nextCourses)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [playgrounduuid, access_token])

  if (session?.status === 'loading') {
    return <PageLoading />
  }

  if (!access_token) {
    return <Navigate to="/auth/login" replace />
  }

  if (missing) {
    return <NotFound />
  }

  if (!loaded || !playground) {
    return <PageLoading />
  }

  return (
    <PlaygroundEditor
      playground={playground}
      orgslug={playground.org_slug || ''}
      accessToken={access_token}
      orgCourses={orgCourses}
    />
  )
}
