import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { lazy } from "react";

const EmbedObjectsComponent = lazy(() => import('./EmbedObjectsComponent'))


export default Node.create({
  name: 'blockEmbed',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      embedUrl: {
        default: null,
      },
      embedCode: {
        default: null,
      },
      embedType: {
        default: null,
      },
      embedHeight: {
        default: 300,
      },
      embedAspectRatio: {
        default: null,
      },
      embedWidth: {
        default: '100%',
      },
      alignment: {
        default: 'left',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'block-embed',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-embed', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedObjectsComponent as any)
  },
  
})