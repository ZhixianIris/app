import React from 'react'
import CourseClient from './course'
import { getCourseMetadata } from '@services/courses/courses'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getCourseThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'
import { getServerSession } from '@/lib/auth/server'
import { getOrgSeoConfig, buildPageTitle } from '@/lib/seo/utils'
import { getServerCanonicalUrl } from '@/lib/seo/utils.server'


type MetadataProps = {
  params: Promise<{ orgslug: string; courseuuid: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
const CoursePage = async (params: any) => {
  const { courseuuid, orgslug } = await params.params
  return (
    <CourseClient
      courseuuid={courseuuid}
      orgslug={orgslug}
      course={null}
      serverError={null}
    />
  )
}

export default CoursePage
