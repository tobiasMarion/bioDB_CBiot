import type { ReturnPosition } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import type { Tube } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine, Package, Scissors } from 'lucide-react'
import { DeleteTubeDialog } from '../delete-tube-dialog'
import { ReturnToFreezerDialog } from '../return-to-freezer/return-to-freezer-dialog'

interface TubeDetailActionsProps {
  tube: Tube
  allTubes: Tube[]
  isCheckedOutByMe: boolean
  canAct: boolean
  otherCells?: Array<{ row: number; col: number }>
  onCheckout?: () => void
  onCheckin?: (position: ReturnPosition) => void
}

export function TubeDetailActions({
  tube,
  allTubes,
  isCheckedOutByMe,
  canAct,
  otherCells = [],
  onCheckout,
  onCheckin
}: TubeDetailActionsProps) {
  return (
    <div className='mt-4 flex items-center justify-between gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        {tube.status === 'in_storage' && (
          <Button variant='outline' size='sm' className='gap-2' onClick={onCheckout}>
            <ArrowUpFromLine className='size-3.5' />
            Checkout from Freezer
          </Button>
        )}
        {isCheckedOutByMe && (
          <>
            <ReturnToFreezerDialog
              tube={tube}
              allTubes={allTubes}
              otherCells={otherCells}
              onConfirm={pos => onCheckin?.(pos)}
            />
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={() => console.log('fractionate', tube.id)}
            >
              <Scissors className='size-3.5' />
              Fractionate
            </Button>
          </>
        )}
        {tube.status === 'unplaced' && (
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => console.log('place in storage', tube.id)}
          >
            <Package className='size-3.5' />
            Place in Storage
          </Button>
        )}
      </div>
      {canAct && (
        <DeleteTubeDialog onDelete={reason => console.log('delete tube', tube.id, reason)} />
      )}
    </div>
  )
}
