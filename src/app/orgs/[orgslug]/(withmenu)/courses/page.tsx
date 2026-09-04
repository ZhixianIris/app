import { useParams } from 'react-router-dom'
import React from 'react'
import Courses from './courses'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getOrgThumbnailMediaDirectory, getOrgOgImageMediaDirectory } from '@services/media/media'

const CoursesPage = () => {
  const { orgslug } = useParams() as { orgslug: string }
  const orgslugValue = orgslug ?? ''
  return <Courses orgslug={orgslugValue} />
}

export default CoursesPage
