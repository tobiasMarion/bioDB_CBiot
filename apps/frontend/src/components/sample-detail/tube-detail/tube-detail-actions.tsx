import type { ReturnPosition } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import { ReturnToFreezerDialog } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import type { Tube } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine, Scissors } from 'lucide-react'
import { DeleteTubeDialog } from '../delete-tube-dialog'

interface TubeDetailActionsProps {
  tube: Tube
  allTubes: Tube[]
  groupId: string
  isCheckedOutByMe: boolean
  canAct: boolean
  isPending?: boolean
  onCheckout?: () => void
  onCheckin?: (position: ReturnPosition) => void
  onDelete?: (reason: string) => void
}

export function TubeDetailActions({
  tube,
  allTubes,
  groupId,
  isCheckedOutByMe,
  canAct,
  isPending = false,
  onCheckout,
  onCheckin,
  onDelete
}: TubeDetailActionsProps) {
  return (
    <div className='mt-4 flex items-center justify-between gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        {tube.status === 'in_storage' && (
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={onCheckout}
            disabled={isPending}
          >
            <ArrowUpFromLine className='size-3.5' />
            Checkout from Freezer
          </Button>
        )}
        {isCheckedOutByMe && (
          <>
            <ReturnToFreezerDialog
              tube={tube}
              allTubes={allTubes}
              groupId={groupId}
              variant='return'
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
          <ReturnToFreezerDialog
            tube={tube}
            allTubes={allTubes}
            groupId={groupId}
            variant='place'
            onConfirm={pos => onCheckin?.(pos)}
          />
        )}
      </div>
      {canAct && onDelete && <DeleteTubeDialog onDelete={onDelete} isPending={isPending} />}
    </div>
  )
}
