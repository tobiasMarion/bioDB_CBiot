import type { Role } from '@/components/attributes/types'
import { ShareSampleDialog } from '@/components/sample-detail/share-sample-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getSamples } from '@/lib/api/get-samples'
import { getSamplesTypes } from '@/lib/api/get-samples-types'
import { useQuery } from '@tanstack/react-query'
import { PackagePlus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CreateBoxForGroupDialog } from './create-box-for-group-dialog'
import { CreateSampleDialog } from './create-sample-dialog'
import { SampleRow } from './sample-row'
import { SamplesPagination } from './samples-pagination'
import { SamplesTableSkeleton } from './samples-table-skeleton'
import { SamplesToolbar } from './samples-toolbar'

interface SamplesTableProps {
  groupId: string
  userRole: Role
  openCreate: boolean
  onOpenChangeCreate: (open: boolean) => void
}

export const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

export function SamplesTable({
  groupId,
  userRole,
  openCreate,
  onOpenChangeCreate
}: SamplesTableProps) {
  const [showCreateBox, setShowCreateBox] = useState(false)
  const [shareSampleId, setShareSampleId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
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
      { search: debouncedSearch, types: typeFilter, page: currentPage, sortBy, sortOrder }
    ],
    queryFn: () =>
      getSamples(groupId, {
        search: debouncedSearch || undefined,
        types: typeFilter.length > 0 ? typeFilter.join(',') : undefined,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        sortBy,
        sortOrder
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

  const handleSortChange = (field: 'name' | 'type' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  return (
    <div className='flex flex-col gap-4'>
      <CreateSampleDialog groupId={groupId} open={openCreate} onOpenChange={onOpenChangeCreate} />
      <CreateBoxForGroupDialog groupId={groupId} open={showCreateBox} onOpenChange={setShowCreateBox} />
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
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </div>
        <Button
          size='sm'
          className='order-1 sm:order-2 gap-2 w-full sm:w-auto [&:hover]:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.08),transparent_50%)]'
          onClick={() => setShowCreateBox(true)}
        >
          <PackagePlus className='size-4' />
          New Box
        </Button>
        <Button
          size='sm'
          className='order-1 sm:order-3 gap-2 w-full sm:w-auto [&:hover]:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.08),transparent_50%)]'
          onClick={() => onOpenChangeCreate(true)}
        >
          <Plus className='size-4' />
          New Sample
        </Button>
      </div>

      {isLoading ? (
        <SamplesTableSkeleton />
      ) : (
        <>
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
                  <TableHead>Created</TableHead>
                  <TableHead className='text-right w-42'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='h-32 text-center'>
                      {hasActiveFilters ? 'No samples match your filters.' : 'No samples found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  samples.map(sample => (
                    <SampleRow
                      key={sample.id}
                      sample={sample}
                      groupId={groupId}
                      canShare={
                        sample.group.id === groupId &&
                        (userRole === 'MANAGER' || userRole === 'LEADER')
                      }
                      onShare={() => setShareSampleId(sample.id)}
                    />
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
        </>
      )}

      {shareSampleId && (
        <ShareSampleDialog
          sampleId={shareSampleId}
          open
          onOpenChange={open => !open && setShareSampleId(null)}
        />
      )}
    </div>
  )
}
