import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { lazy } from "react";

const AudioBlockComponent = lazy(() => import('./AudioBlockComponent'))

export default Node.create({
  name: 'blockAudio',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      blockObject: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'block-audio',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-audio', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioBlockComponent as any)
  },
})
