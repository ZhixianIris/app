import React from 'react'
import { useParams } from 'react-router-dom'
import Copilot from './copilot'

const CopilotPage = () => {
  const { orgslug } = useParams() as { orgslug: string }

  return (
    <div>
      <Copilot orgslug={orgslug ?? ''} />
    </div>
  )
}

export default CopilotPage
