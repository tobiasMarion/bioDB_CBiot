import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Room } from '@/lib/api/get-rooms'
import { Pencil, Trash2 } from 'lucide-react'

interface RoomRowProps {
  room: Room
  onEdit: (room: Room) => void
  onArchive: (room: Room) => void
}

export function RoomRow({ room, onEdit, onArchive }: RoomRowProps) {
  return (
    <TableRow>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <code className='text-xs text-muted-foreground truncate max-w-20 block'>
                {room.id.slice(0, 8)}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <p className='font-mono text-xs'>{room.id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className='font-medium'>{room.number}</TableCell>
      <TableCell>{room.building}</TableCell>
      <TableCell>{room.floor}</TableCell>
      <TableCell className='text-muted-foreground text-sm'>
        {new Date(room.createdAt).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell className='text-right'>
        <div className='flex items-center justify-end gap-1'>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1.5 text-xs text-muted-foreground'
            onClick={() => onEdit(room)}
          >
            <Pencil className='size-3' />
            Edit
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive'
            onClick={() => onArchive(room)}
          >
            <Trash2 className='size-3' />
            Archive
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
