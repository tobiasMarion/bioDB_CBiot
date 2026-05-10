import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lock, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AttributeBooleanInput } from './attribute-boolean-input'
import { AttributeDateInput } from './attribute-date-input'
import { AttributeNumberInput } from './attribute-number-input'
import { AttributeStringInput } from './attribute-string-input'
import { type Attribute, ROLE_LABELS, ROLE_ORDER, type Role, canEditAttribute } from './types'

interface AttributeFieldProps {
  attribute: Attribute
  userRole: Role
  onChange: (key: string, value: Attribute['value']) => void
  onDelete?: (key: string) => void
  deleteRole?: Role
  compact?: boolean
}

function formatValue(attribute: Attribute): string | null {
  const { value, type } = attribute
  if (value === null || value === undefined || value === '') return null
  if (type === 'date' && typeof value === 'string') {
    try {
      return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return value
    }
  }
  if (type === 'boolean') return value ? 'True' : 'False'
  return String(value)
}

export function AttributeField({
  attribute,
  userRole,
  onChange,
  onDelete,
  deleteRole = 'LEADER',
  compact = false
}: AttributeFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(attribute.value)

  const canEdit = canEditAttribute(userRole, attribute.minRole)
  const canDelete = !!onDelete && canEdit && ROLE_ORDER[userRole] >= ROLE_ORDER[deleteRole]

  useEffect(() => {
    setDraft(attribute.value)
  }, [attribute.value])

  const commit = () => {
    onChange(attribute.key, draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(attribute.value)
    setEditing(false)
  }

  const displayValue = formatValue(attribute)
  const labelCols = compact ? '120px' : '160px'

  return (
    <div
      className='group grid items-center gap-x-4 rounded-md px-3 py-1.5 transition-colors duration-150 hover:bg-muted/40'
      style={{ gridTemplateColumns: `${labelCols} 1fr auto` }}
    >
      <p className='select-none truncate text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        {attribute.label}
      </p>

      <div className='min-w-0'>
        {attribute.type === 'boolean' ? (
          <AttributeBooleanInput
            value={!!attribute.value}
            onChange={v => onChange(attribute.key, v)}
            disabled={!canEdit}
          />
        ) : editing ? (
          <>
            {attribute.type === 'string' && (
              <AttributeStringInput
                value={(draft as string) ?? ''}
                onChange={setDraft}
                onCommit={commit}
                onCancel={cancel}
              />
            )}
            {attribute.type === 'number' && (
              <AttributeNumberInput
                value={(draft as number) ?? 0}
                onChange={setDraft}
                onCommit={commit}
                onCancel={cancel}
              />
            )}
            {attribute.type === 'date' && (
              <AttributeDateInput
                value={(draft as string) ?? ''}
                onChange={setDraft}
                onCommit={commit}
                onCancel={cancel}
              />
            )}
          </>
        ) : (
          <button
            type='button'
            disabled={!canEdit}
            onClick={() => {
              setDraft(attribute.value)
              setEditing(true)
            }}
            className='flex h-8 w-full items-center rounded-sm px-1 text-left text-sm transition-colors disabled:cursor-default enabled:hover:underline enabled:hover:decoration-dashed enabled:hover:underline-offset-4'
          >
            {displayValue !== null ? (
              <span className={attribute.type === 'number' ? 'font-mono' : ''}>{displayValue}</span>
            ) : (
              <span className='italic text-muted-foreground/40'>—</span>
            )}
          </button>
        )}
      </div>

      <div className='flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
        {!canEdit && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground'>
                  <Lock className='size-2.5' />
                  {ROLE_LABELS[attribute.minRole]}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side='left'>
                <p className='text-xs'>Requires {ROLE_LABELS[attribute.minRole]} or higher</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {canDelete && (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive'
            onClick={() => onDelete?.(attribute.key)}
            aria-label={`Delete ${attribute.label}`}
          >
            <Trash2 className='size-3.5' />
          </Button>
        )}
      </div>
    </div>
  )
}
