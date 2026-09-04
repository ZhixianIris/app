import React from 'react'
import { useParams } from 'react-router-dom'
import Trail from './trail'

const TrailPage = () => {
  const { orgslug } = useParams() as { orgslug: string }

  return (
    <div>
      <Trail orgslug={orgslug ?? ''} />
    </div>
  )
}

export default TrailPage
