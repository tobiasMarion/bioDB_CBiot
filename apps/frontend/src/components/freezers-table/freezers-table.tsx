import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { type Freezer, getFreezers } from '@/lib/api/get-freezers'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { FreezerRow } from './freezer-row'
import { FreezersTableSkeleton } from './freezers-table-skeleton'

interface FreezersTableProps {
  onNewFreezer: () => void
  onEditFreezer: (freezer: Freezer) => void
  onArchiveFreezer: (freezer: Freezer) => void
}

export function FreezersTable({
  onNewFreezer,
  onEditFreezer,
  onArchiveFreezer
}: FreezersTableProps) {
  const { data: freezers, isLoading } = useQuery({
    queryKey: ['freezers'],
    queryFn: getFreezers
  })

  const hasFreezers = freezers && freezers.length > 0

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div />
        <Button size='sm' className='gap-2' onClick={onNewFreezer}>
          <Plus className='size-4' />
          New Freezer
        </Button>
      </div>

      {isLoading ? (
        <FreezersTableSkeleton />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className='text-right w-48'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasFreezers ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-32 text-center'>
                    No freezers found.
                  </TableCell>
                </TableRow>
              ) : (
                freezers.map(freezer => (
                  <FreezerRow
                    key={freezer.id}
                    freezer={freezer}
                    onEdit={onEditFreezer}
                    onArchive={onArchiveFreezer}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
