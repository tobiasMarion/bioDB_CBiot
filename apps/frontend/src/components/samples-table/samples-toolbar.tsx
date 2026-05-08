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
import { Check, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

interface SamplesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string[]
  onTypeFilterChange: (value: string[]) => void
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
  const [pendingTypes, setPendingTypes] = useState<string[]>(typeFilter)
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = (typeFilter.length > 0 ? 1 : 0) + (search ? 1 : 0)

  const handleTypeToggle = (type: string) => {
    if (pendingTypes.includes(type)) {
      setPendingTypes(pendingTypes.filter(t => t !== type))
    } else {
      setPendingTypes([...pendingTypes, type])
    }
  }

  const handleSelectAll = () => {
    if (pendingTypes.length === availableTypes.length) {
      setPendingTypes([])
    } else {
      setPendingTypes([...availableTypes])
    }
  }

  const handleApply = () => {
    onTypeFilterChange(pendingTypes)
    setIsOpen(false)
  }

  const handleClear = () => {
    setPendingTypes([])
  }

  const filterLabel =
    typeFilter.length === 0
      ? 'All Types'
      : typeFilter.length === 1
        ? typeFilter[0]
        : `${typeFilter.length} types`

  const hasPendingChanges = JSON.stringify(pendingTypes) !== JSON.stringify(typeFilter)

  return (
    <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
      <div className='relative w-full'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
        <Input
          placeholder='Search samples...'
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className='pl-9 h-9 w-full'
        />
      </div>

      <div className='flex gap-2 w-full sm:w-auto'>
        <DropdownMenu
          modal={false}
          open={isOpen}
          onOpenChange={open => {
            setIsOpen(open)
            if (open) setPendingTypes(typeFilter)
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-9 gap-2'>
              <SlidersHorizontal className='size-4' />
              {filterLabel}
              {hasActiveFilters && (
                <span className='ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-56'
            onCloseAutoFocus={e => e.preventDefault()}
          >
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={pendingTypes.length === 0}
              onCheckedChange={handleClear}
              onSelect={e => e.preventDefault()}
            >
              No filter
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={pendingTypes.length === availableTypes.length && availableTypes.length > 0}
              onCheckedChange={handleSelectAll}
              onSelect={e => e.preventDefault()}
            >
              {pendingTypes.length === availableTypes.length ? 'Deselect all' : 'Select all'}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {availableTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={pendingTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
                onSelect={e => e.preventDefault()}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <div className='px-2 py-1.5'>
              <Button
                size='sm'
                className='w-full gap-2'
                onClick={handleApply}
                disabled={!hasPendingChanges}
              >
                <Check className='size-3' />
                Apply Filter
              </Button>
            </div>
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
