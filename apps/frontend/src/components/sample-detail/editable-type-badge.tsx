import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useInlineEdit } from './inline-edit'

interface EditableTypeBadgeProps {
  value: string
  onChange: (v: string) => void
  canEdit: boolean
}

export function EditableTypeBadge({ value, onChange, canEdit }: EditableTypeBadgeProps) {
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
        className='inline-block w-20 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-center text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring'
      />
    )
  }

  return (
    <Badge
      variant='outline'
      onClick={() => canEdit && setEditing(true)}
      className={cn(
        'text-xs text-muted-foreground',
        canEdit && 'cursor-pointer transition-colors hover:bg-muted/50'
      )}
    >
      {value}
    </Badge>
  )
}
