import { getOrganizationContextInfo } from '@services/organizations/orgs'
import React from 'react'
import CoursesHome from './client'

type MetadataProps = {
  params: Promise<{ orgslug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function CoursesPage(props: { params: Promise<{ orgslug: string }> }) {
  const { orgslug } = await props.params
  return <CoursesHome orgslug={orgslug} />
}

export default CoursesPage
