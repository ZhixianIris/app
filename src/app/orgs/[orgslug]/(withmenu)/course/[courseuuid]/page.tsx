import React from 'react'
import { useParams } from 'react-router-dom'
import CourseClient from './course'

const CoursePage = () => {
  const { courseuuid, orgslug } = useParams() as { courseuuid: string; orgslug: string }
  return (
    <CourseClient
      courseuuid={courseuuid ?? ''}
      orgslug={orgslug ?? ''}
      course={null}
      serverError={null}
    />
  )
}

export default CoursePage
