import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { lazy } from "react";

const QuizBlockComponent = lazy(() => import('./QuizBlockComponent'))

export default Node.create({
  name: 'blockQuiz',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      quizId: {
        default: null,
      },
      questions: {
        default: [],
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'block-quiz',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-quiz', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockComponent as any)
  },
})
