import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getAllUsers } from '@/lib/api/get-all-users'
import type { AuditAction, AuditEntityType } from '@/lib/api/get-audit-logs'
import type { User } from '@/lib/api/types/user'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { useState } from 'react'

const ALL_ENTITY_TYPES: AuditEntityType[] = [
  'SAMPLE', 'TUBE', 'GROUP', 'SHARE', 'USER', 'FREEZER', 'MEMBERSHIP', 'INVITE', 'ROOM'
]

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
  selectedUser: User | null
  onUserSelect: (user: User | null) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
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
  selectedUser,
  onUserSelect,
  hasActiveFilters,
  onClearFilters,
  availableEntityTypes
}: AuditToolbarProps) {
  const entityTypes = availableEntityTypes ?? ALL_ENTITY_TYPES
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getAllUsers
  })

  return (
    <div className='flex flex-col gap-2'>
      {/* Linha 1: busca + entidade + ação + usuário + limpar */}
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

        {/* User picker — mesmo padrão do invite dialog */}
        <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className='h-9 w-44 justify-between font-normal px-3'
            >
              <span className='truncate text-sm'>
                {selectedUser ? selectedUser.name : 'All users'}
              </span>
              <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='start'
            sideOffset={4}
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            className='p-0 border-none'
          >
            <Command className='w-full border shadow-md'>
              <CommandInput placeholder='Search user...' className='h-9 w-full' />
              <CommandList className='max-h-48 overflow-y-auto w-full'>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {/* Opção para limpar o filtro de usuário */}
                  <CommandItem
                    value='all users'
                    onSelect={() => {
                      onUserSelect(null)
                      setUserPopoverOpen(false)
                    }}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn('mr-2 size-4', !selectedUser ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className='text-muted-foreground'>All users</span>
                  </CommandItem>
                  {users.map(user => (
                    <CommandItem
                      key={user.id}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => {
                        onUserSelect(user)
                        setUserPopoverOpen(false)
                      }}
                      className='cursor-pointer'
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedUser?.id === user.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className='flex flex-col overflow-hidden'>
                        <span className='font-medium truncate'>{user.name}</span>
                        <span className='text-xs text-muted-foreground truncate'>{user.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
