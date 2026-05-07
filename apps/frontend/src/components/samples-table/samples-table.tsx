import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { Plus } from 'lucide-react'
// import { getSamples } from '@/lib/api/get-samples'
import type { Sample } from '@/lib/api/get-samples'
import { SamplesToolbar } from './samples-toolbar'
import { SamplesPagination } from './samples-pagination'
import { SamplesActions } from './samples-actions'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SamplesTableProps {
  groupId: string
}

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

// TODO: remove once backend is ready
const MOCK_SAMPLES: Sample[] = [
  {
    id: 'a1b2c3d4-0001',
    name: 'Alpha Strain 01',
    type: 'Bacteria',
    tubesCount: 4,
    originOrganism: 'E. coli',
    sourceLab: 'Lab A',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0002',
    name: 'Beta Culture 02',
    type: 'Fungi',
    tubesCount: 2,
    originOrganism: 'Aspergillus niger',
    sourceLab: 'Lab B',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0003',
    name: 'Gamma Extract 03',
    type: 'Virus',
    tubesCount: 6,
    originOrganism: 'Homo sapiens',
    sourceLab: 'Lab C',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0004',
    name: 'Delta Probe 04',
    type: 'Bacteria',
    tubesCount: 1,
    originOrganism: 'Salmonella sp.',
    sourceLab: 'Lab A',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0005',
    name: 'Epsilon Line 05',
    type: 'Cell Line',
    tubesCount: 8,
    originOrganism: 'Mus musculus',
    sourceLab: 'Lab D',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0006',
    name: 'Zeta Sample 06',
    type: 'Fungi',
    tubesCount: 3,
    originOrganism: 'Candida albicans',
    sourceLab: 'Lab B',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0007',
    name: 'Eta Clone 07',
    type: 'Bacteria',
    tubesCount: 5,
    originOrganism: 'Staphylococcus aureus',
    sourceLab: 'Lab C',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0008',
    name: 'Theta Isolate 08',
    type: 'Virus',
    tubesCount: 2,
    originOrganism: 'Rattus norvegicus',
    sourceLab: 'Lab A',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0009',
    name: 'Iota Prep 09',
    type: 'Cell Line',
    tubesCount: 7,
    originOrganism: 'Homo sapiens',
    sourceLab: 'Lab D',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0010',
    name: 'Kappa Batch 10',
    type: 'Bacteria',
    tubesCount: 9,
    originOrganism: 'Pseudomonas aeruginosa',
    sourceLab: 'Lab B',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0011',
    name: 'Lambda Stock 11',
    type: 'Fungi',
    tubesCount: 1,
    originOrganism: 'Penicillium chrysogenum',
    sourceLab: 'Lab C',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0012',
    name: 'Mu Fraction 12',
    type: 'Virus',
    tubesCount: 4,
    originOrganism: 'Mus musculus',
    sourceLab: 'Lab A',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0013',
    name: 'Nu Aliquot 13',
    type: 'Cell Line',
    tubesCount: 3,
    originOrganism: 'Rattus norvegicus',
    sourceLab: 'Lab D',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0014',
    name: 'Xi Culture 14',
    type: 'Bacteria',
    tubesCount: 6,
    originOrganism: 'Bacillus subtilis',
    sourceLab: 'Lab B',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0015',
    name: 'Omicron Prep 15',
    type: 'Virus',
    tubesCount: 2,
    originOrganism: 'Homo sapiens',
    sourceLab: 'Lab C',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0016',
    name: 'Pi Reserve 16',
    type: 'Cell Line',
    tubesCount: 5,
    originOrganism: 'Mus musculus',
    sourceLab: 'Lab D',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0017',
    name: 'Rho Deposit 17',
    type: 'Fungi',
    tubesCount: 3,
    originOrganism: 'Saccharomyces cerevisiae',
    sourceLab: 'Lab A',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  },
  {
    id: 'a1b2c3d4-0018',
    name: 'Sigma Pool 18',
    type: 'Bacteria',
    tubesCount: 7,
    originOrganism: 'Klebsiella pneumoniae',
    sourceLab: 'Lab B',
    groupId: 'g1',
    createdBy: 'u1',
    createdAt: '2024-01-27T10:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z',
    creator: { id: 'u1', name: 'Ana Lima', email: 'ana@lab.com' }
  },
  {
    id: 'a1b2c3d4-0019',
    name: 'Tau Extract 19',
    type: 'Virus',
    tubesCount: 1,
    originOrganism: 'Rattus norvegicus',
    sourceLab: 'Lab C',
    groupId: 'g1',
    createdBy: 'u3',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
    creator: { id: 'u3', name: 'Carla Dias', email: 'carla@lab.com' }
  },
  {
    id: 'a1b2c3d4-0020',
    name: 'Upsilon Set 20',
    type: 'Cell Line',
    tubesCount: 4,
    originOrganism: 'Homo sapiens',
    sourceLab: 'Lab D',
    groupId: 'g1',
    createdBy: 'u2',
    createdAt: '2024-01-29T10:00:00Z',
    updatedAt: '2024-01-29T10:00:00Z',
    creator: { id: 'u2', name: 'Bruno Costa', email: 'bruno@lab.com' }
  }
]

export function SamplesTable({ groupId }: SamplesTableProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: [
      'samples',
      groupId,
      { search: debouncedSearch, type: typeFilter, page: currentPage }
    ],
    queryFn: () =>
      // TODO: replace mock with real call once backend is ready:
      // getSamples(groupId, {
      //   search: debouncedSearch || undefined,
      //   type: typeFilter || undefined,
      //   page: currentPage,
      //   pageSize: ITEMS_PER_PAGE
      // })
      Promise.resolve({ samples: MOCK_SAMPLES, total: MOCK_SAMPLES.length })
  })

  const samples = data?.samples ?? []
  const totalItems = data?.total ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const availableTypes = Array.from(
    new Set(samples.map((s: Sample) => s.type).filter(Boolean))
  ).sort() as string[]

  const hasActiveFilters = !!search || !!typeFilter

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setCurrentPage(1)
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
      <div className='flex items-center justify-between'>
        <SamplesToolbar
          search={search}
          onSearchChange={handleSearchChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          availableTypes={availableTypes}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <Button
          size='sm'
          className='gap-2 shrink-0 [&:hover]:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.08),transparent_50%)]'
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
              <TableHead>Type</TableHead>
              <TableHead>Source Lab</TableHead>
              <TableHead>Origin Organism</TableHead>
              <TableHead className='text-right'>Tubes</TableHead>
              <TableHead className='text-right w-[168px]'>Actions</TableHead>
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
                  </TableCell>
                  <TableCell>
                    <button
                      type='button'
                      onClick={() => handleView(sample)}
                      className='font-medium hover:underline text-left cursor-pointer'
                    >
                      {sample.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{sample.type}</Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{sample.sourceLab || '-'}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {sample.originOrganism || '-'}
                  </TableCell>
                  <TableCell className='text-right font-mono text-sm'>
                    {sample.tubesCount}
                  </TableCell>
                  <TableCell className='text-right'>
                    <SamplesActions
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
