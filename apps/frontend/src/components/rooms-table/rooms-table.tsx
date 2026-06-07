import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { type Room, getRooms } from '@/lib/api/get-rooms'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { RoomRow } from './room-row'
import { RoomsTableSkeleton } from './rooms-table-skeleton'

interface RoomsTableProps {
  onNewRoom: () => void
  onEditRoom: (room: Room) => void
  onArchiveRoom: (room: Room) => void
}

export function RoomsTable({ onNewRoom, onEditRoom, onArchiveRoom }: RoomsTableProps) {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  })

  const hasRooms = rooms && rooms.length > 0

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div />
        <Button size='sm' className='gap-2' onClick={onNewRoom}>
          <Plus className='size-4' />
          New Room
        </Button>
      </div>

      {isLoading ? (
        <RoomsTableSkeleton />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>ID</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right w-48'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasRooms ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-32 text-center'>
                    No rooms found.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map(room => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    onEdit={onEditRoom}
                    onArchive={onArchiveRoom}
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
