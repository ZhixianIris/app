import { getServerSession } from '@/lib/auth/server'
import { getPlayground } from '@services/playgrounds/playgrounds'
import { getOrgCourses } from '@services/courses/courses'
import PlaygroundEditor from '@components/Playground/PlaygroundEditor'
import { redirect } from "react-router-dom";

type PageParams = Promise<{ playgrounduuid: string }>

export default async function EditPlaygroundPage({ params }: { params: PageParams }) {
  const { playgrounduuid } = await params
  const session = await getServerSession()
  const access_token = session?.tokens?.access_token

  if (!access_token) {
    redirect('/auth/login')
  }

  let playground
  try {
    playground = await getPlayground(playgrounduuid, access_token)
  } catch {
    notFound()
  }

  let orgCourses: { course_uuid: string; name: string }[] = []
  if (playground.org_slug) {
    try {
      const coursesRes = await getOrgCourses(playground.org_slug, null, access_token, true)
      orgCourses = (Array.isArray(coursesRes) ? coursesRes : []).map((c: any) => ({
        course_uuid: c.course_uuid,
        name: c.name,
      }))
    } catch {
      // Non-fatal — proceed without course context
    }
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
