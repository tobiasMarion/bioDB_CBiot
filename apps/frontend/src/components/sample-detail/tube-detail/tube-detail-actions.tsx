import type { ReturnPosition } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import { ReturnToFreezerDialog } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import type { Tube } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine, Scissors } from 'lucide-react'
import { DeleteTubeDialog } from '../delete-tube-dialog'
import { FractionateTubeDialog } from '../fractionate-tube-dialog'

interface TubeDetailActionsProps {
  tube: Tube
  allTubes: Tube[]
  groupId: string
  isCheckedOutByMe: boolean
  canAct: boolean
  isPending?: boolean
  onCheckout?: () => void
  onCheckin?: (position: ReturnPosition) => void
  onFractionate?: (quantity: number) => void
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
  onFractionate,
  onDelete
}: TubeDetailActionsProps) {
  const canFractionate =
    onFractionate && (isCheckedOutByMe || tube.status === 'unplaced')

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
          <ReturnToFreezerDialog
            tube={tube}
            allTubes={allTubes}
            groupId={groupId}
            variant='return'
            onConfirm={pos => onCheckin?.(pos)}
          />
        )}
        {canFractionate && (
          <FractionateTubeDialog tube={tube} onFractionate={onFractionate} />
        )}
        {tube.status === 'unplaced' && !isCheckedOutByMe && (
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
