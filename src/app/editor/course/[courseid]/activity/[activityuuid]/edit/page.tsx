import { default as React } from 'react'
import { useParams } from 'react-router-dom'
import EditorOptionsProvider from '@components/Contexts/Editor/EditorContext'
import AIEditorProvider from '@components/Contexts/AI/AIEditorContext'
import EditorLoader from '@components/Objects/Editor/EditorLoader'

const EditActivity = () => {
  const { activityuuid, courseid } = useParams() as { activityuuid: string; courseid: string }

  return (
    <EditorOptionsProvider options={{ isEditable: true }}>
      <AIEditorProvider>
        <EditorLoader courseid={courseid ?? ''} activityuuid={activityuuid ?? ''} />
      </AIEditorProvider>
    </EditorOptionsProvider>
  )
}

export default EditActivity
