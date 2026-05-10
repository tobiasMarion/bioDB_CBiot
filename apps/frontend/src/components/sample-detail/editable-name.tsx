import { cn } from '@/lib/utils'
import { useInlineEdit } from './inline-edit'

interface EditableNameProps {
  value: string
  onChange: (v: string) => void
  canEdit: boolean
}

export function EditableName({ value, onChange, canEdit }: EditableNameProps) {
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
        className='w-full border-0 border-b-2 border-muted-foreground/30 bg-transparent text-3xl font-semibold tracking-tight text-foreground outline-none focus:border-foreground lg:text-4xl'
      />
    )
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: supplemental click target; keyboard users reach the input via Tab
    <h1
      onClick={() => canEdit && setEditing(true)}
      className={cn(
        'text-3xl font-semibold tracking-tight lg:text-4xl',
        canEdit && 'cursor-text transition-opacity hover:opacity-70'
      )}
    >
      {value}
    </h1>
  )
}
