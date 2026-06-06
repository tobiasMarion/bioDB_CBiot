import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { AuditAction, AuditEntityType } from '@/lib/api/get-audit-logs'
import { Search, X } from 'lucide-react'

// Todos os tipos de entidade possíveis para o admin
const ALL_ENTITY_TYPES: AuditEntityType[] = [
  'SAMPLE', 'TUBE', 'GROUP', 'SHARE', 'USER', 'FREEZER', 'MEMBERSHIP', 'INVITE', 'ROOM'
]

// Tipos visíveis no contexto de grupo (espelha GROUP_ENTITY_TYPES do backend)
export const GROUP_ENTITY_TYPES: AuditEntityType[] = [
  'SAMPLE', 'TUBE', 'GROUP', 'SHARE', 'MEMBERSHIP', 'INVITE'
]

const ALL_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'ARCHIVE', 'MOVE', 'HANDLE', 'SHARE']

interface AuditToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  entityType: AuditEntityType | undefined
  onEntityTypeChange: (value: AuditEntityType | undefined) => void
  action: AuditAction | undefined
  onActionChange: (value: AuditAction | undefined) => void
  fromDate: string
  onFromDateChange: (value: string) => void
  toDate: string
  onToDateChange: (value: string) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  // Se fornecido, restringe os tipos de entidade disponíveis (contexto de grupo)
  availableEntityTypes?: AuditEntityType[]
}

export function AuditToolbar({
  search,
  onSearchChange,
  entityType,
  onEntityTypeChange,
  action,
  onActionChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  hasActiveFilters,
  onClearFilters,
  availableEntityTypes
}: AuditToolbarProps) {
  const entityTypes = availableEntityTypes ?? ALL_ENTITY_TYPES

  return (
    <div className='flex flex-col gap-2'>
      {/* Linha 1: busca + entidade + ação */}
      <div className='flex flex-wrap gap-2'>
        <div className='relative flex-1 min-w-48'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='Search by name or ID...'
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className='pl-9 h-9'
          />
        </div>

        <Select
          value={entityType ?? 'all'}
          onValueChange={v => onEntityTypeChange(v === 'all' ? undefined : (v as AuditEntityType))}
        >
          <SelectTrigger className='h-9 w-40'>
            <SelectValue placeholder='Entity type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All entities</SelectItem>
            {entityTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={action ?? 'all'}
          onValueChange={v => onActionChange(v === 'all' ? undefined : (v as AuditAction))}
        >
          <SelectTrigger className='h-9 w-36'>
            <SelectValue placeholder='Action' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All actions</SelectItem>
            {ALL_ACTIONS.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            className='h-9 px-2 text-muted-foreground'
            onClick={onClearFilters}
          >
            <X className='size-4' />
          </Button>
        )}
      </div>

      {/* Linha 2: range de datas */}
      <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
        <span>From</span>
        <input
          type='date'
          value={fromDate}
          onChange={e => onFromDateChange(e.target.value)}
          className='h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        />
        <span>to</span>
        <input
          type='date'
          value={toDate}
          onChange={e => onToDateChange(e.target.value)}
          className='h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        />
      </div>
    </div>
  )
}
