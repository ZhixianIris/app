import React, { useRef, useState } from 'react'
import { X } from 'lucide-react'

interface FormTagInputProps {
  value: string
  onChange: (value: string) => void
  separator?: string
  error?: string
  placeholder?: string
}

interface Tag {
  id: string
  text: string
}

const splitTags = (value: string, separator: string): Tag[] =>
  value && typeof value === 'string'
    ? value
        .split(separator)
        .filter((text) => text.trim())
        .map((text, i) => ({ id: i.toString(), text: text.trim() }))
    : []

/**
 * Tag-list form control. Enter or the separator commits the pending text,
 * Backspace on an empty input removes the last tag, and each chip carries a
 * remove button. The `value`/`onChange` contract stays a separator-joined
 * string so existing form wiring is untouched.
 */
const FormTagInput = ({
  value,
  onChange,
  separator = '|',
  error,
  placeholder,
}: FormTagInputProps) => {
  const [tags, setTags] = useState<Tag[]>(() => splitTags(value, separator))
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commitTags = (next: Tag[]) => {
    setTags(next)
    onChange(next.map((tag) => tag.text).join(separator))
  }

  const commitDraft = () => {
    const text = draft.trim()
    if (!text) return
    if (tags.some((tag) => tag.text === text)) {
      setDraft('')
      return
    }
    commitTags([...tags, { id: `${Date.now()}`, text }])
    setDraft('')
  }

  const removeTag = (id: string) => {
    commitTags(tags.filter((tag) => tag.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === separator) {
      e.preventDefault()
      commitDraft()
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      commitTags(tags.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-input bg-background p-1 shadow-2xs transition-shadow focus-within:border-ring/40 focus-within:outline-hidden focus-within:ring-[3px] focus-within:ring-ring/8">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7 inline-flex items-center"
            >
              {tag.text}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                aria-label={`Remove ${tag.text}`}
                className="absolute -inset-y-px -end-px p-0 rounded-e-lg flex size-7 items-center justify-center transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring/30 text-muted-foreground/80 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitDraft}
            placeholder={tags.length === 0 ? placeholder : undefined}
            className="w-full min-w-[80px] flex-1 focus-visible:outline-hidden shadow-none px-2 h-7 bg-transparent"
          />
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    </div>
  )
}

export default FormTagInput
