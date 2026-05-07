import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface SamplesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  availableTypes: string[]
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function SamplesToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  availableTypes,
  onClearFilters,
  hasActiveFilters
}: SamplesToolbarProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center'>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
        <Input
          placeholder='Search samples...'
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className='pl-9 h-9'
        />
      </div>

      <div className='flex gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-9 gap-2'>
              <SlidersHorizontal className='size-4' />
              Filters
              {hasActiveFilters && (
                <span className='ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
                  {(typeFilter ? 1 : 0) + (search ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={typeFilter === ''}
              onCheckedChange={() => onTypeFilterChange('')}
            >
              All Types
            </DropdownMenuCheckboxItem>
            {availableTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={typeFilter === type}
                onCheckedChange={() => onTypeFilterChange(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
    </div>
  )
}
