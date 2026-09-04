import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { lazy } from "react";

const VideoBlockComponent = lazy(() => import('./VideoBlockComponent'))

export default Node.create({
  name: 'blockVideo',
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
        tag: 'block-video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockComponent as any)
  },
})
