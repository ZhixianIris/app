import React from 'react'
import { useParams } from 'react-router-dom'
import LibraryClient from './LibraryClient'

const LibraryPage = () => {
  const { orgslug } = useParams() as { orgslug: string }
  return <LibraryClient orgslug={orgslug ?? ''} />
}

export default LibraryPage
