import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getSamples } from '@/lib/api/get-samples'
import type { Sample } from '@/lib/api/get-samples'
import { getSamplesTypes } from '@/lib/api/get-samples-types'
import { useQuery } from '@tanstack/react-query'
import { Plus, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SamplesActions } from './samples-actions'
import { SamplesPagination } from './samples-pagination'
import { SamplesToolbar } from './samples-toolbar'

interface SamplesTableProps {
  groupId: string
}

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

export function SamplesTable({ groupId }: SamplesTableProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const { data: availableTypesData } = useQuery({
    queryKey: ['samples-types', groupId],
    queryFn: () => getSamplesTypes(groupId)
  })

  const availableTypes = availableTypesData ?? []

  const { data, isLoading } = useQuery({
    queryKey: [
      'samples',
      groupId,
      { search: debouncedSearch, types: typeFilter, page: currentPage }
    ],
    queryFn: () =>
      getSamples(groupId, {
        search: debouncedSearch || undefined,
        types: typeFilter.length > 0 ? typeFilter.join(',') : undefined,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE
      })
  })

  const samples = data?.samples ?? []
  const totalItems = data?.total ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const hasActiveFilters = !!search || typeFilter.length > 0

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (selectedTypes: string[]) => {
    setTypeFilter(selectedTypes)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setTypeFilter([])
    setCurrentPage(1)
  }

  function isSharedSample(sample: Sample) {
    return sample.group.id !== groupId
  }

  const handleView = (sample: Sample) => {
    console.log('View sample:', sample.id)
  }

  const handleShare = (sample: Sample) => {
    console.log('Share sample:', sample.id)
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-10 w-full' />
        <div className='rounded-md border'>
          <div className='border-b'>
            <div className='grid grid-cols-7 gap-4 p-4'>
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className='h-4' />
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='grid grid-cols-7 gap-4 p-4 border-t'>
              {[...Array(7)].map((_, j) => (
                <Skeleton key={j} className='h-4' />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
        <div className='flex-1 order-2 sm:order-1'>
          <SamplesToolbar
            search={search}
            onSearchChange={handleSearchChange}
            typeFilter={typeFilter}
            onTypeFilterChange={handleTypeFilterChange}
            availableTypes={availableTypes}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
        <Button
          size='sm'
          className='order-1 sm:order-2 gap-2 w-full sm:w-auto [&:hover]:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.08),transparent_50%)]'
        >
          <Plus className='size-4' />
          New Sample
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className='text-right'>Tubes</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source Lab</TableHead>
              <TableHead>Origin Organism</TableHead>
              <TableHead className='text-right w-42'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-32 text-center'>
                  {hasActiveFilters ? 'No samples match your filters.' : 'No samples found.'}
                </TableCell>
              </TableRow>
            ) : (
              samples.map(sample => (
                <TableRow key={sample.id}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code className='text-xs text-muted-foreground truncate max-w-20 block'>
                            {sample.id.slice(0, 8)}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='font-mono text-xs'>{sample.id}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      onClick={() => handleView(sample)}
                      className='flex gap-2 items-center'
                    >
                      {sample.name}
                      {isSharedSample(sample) && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className='flex items-center justify-center p-1 -m-1'>
                                <Share2 className='size-4 text-muted-foreground' />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side='top'>
                              <p>Owned by: {sample.group.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className='text-right font-mono text-sm'>
                    {sample.amountOfTubes}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{sample.type}</Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{sample.sourceLab || '-'}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {sample.originOrganism || '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <SamplesActions
                      disableShare={isSharedSample(sample)}
                      onView={() => handleView(sample)}
                      onShare={() => handleShare(sample)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SamplesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
