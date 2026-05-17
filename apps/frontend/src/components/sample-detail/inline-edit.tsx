import { useEffect, useRef, useState } from 'react'

export function useInlineEdit(initial: string) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      ref.current?.focus()
      ref.current?.select()
    }
  }, [editing])

  useEffect(() => {
    if (!editing) setDraft(initial)
  }, [initial, editing])

  return { editing, setEditing, draft, setDraft, ref }
}
