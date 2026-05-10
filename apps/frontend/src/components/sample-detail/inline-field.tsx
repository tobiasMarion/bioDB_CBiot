import { useInlineEdit } from './inline-edit'

interface InlineFieldProps {
  value: string
  onChange: (v: string) => void
  canEdit: boolean
  placeholder?: string
}

export function InlineField({ value, onChange, canEdit, placeholder = '—' }: InlineFieldProps) {
  const { editing, setEditing, draft, setDraft, ref } = useInlineEdit(value)

  const commit = () => {
    onChange(draft.trim() || value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className='w-full border-0 border-b border-muted-foreground/40 bg-transparent pb-0.5 text-sm text-foreground outline-none focus:border-foreground'
      />
    )
  }

  return (
    <button
      type='button'
      disabled={!canEdit}
      onClick={() => setEditing(true)}
      className='text-left text-sm text-muted-foreground/80 transition-colors disabled:cursor-default enabled:hover:text-foreground enabled:hover:underline enabled:hover:decoration-dashed enabled:hover:underline-offset-4'
    >
      {value || <span className='italic opacity-40'>{placeholder}</span>}
    </button>
  )
}
