import type { Tube } from '@/components/tube/tube-data'
import { positionLabel } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CreateBoxForGroupDialog } from '@/components/samples-table/create-box-for-group-dialog'
import { getBoxOccupancy } from '@/lib/api/get-box-occupancy'
import { getGroupFreezers } from '@/lib/api/get-group-freezers'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ReturnPositionGrid } from './return-position-grid'
import { ReturnToFreezerControls } from './return-to-freezer-controls'

export interface ReturnPosition {
  row: number
  col: number
  boxId: string
  freezerId: string
  experimentNotes: string
}

interface ReturnToFreezerDialogProps {
  tube: Tube
  allTubes: Tube[]
  groupId: string
  variant?: 'return' | 'place'
  onConfirm: (position: ReturnPosition) => void
}

export function ReturnToFreezerDialog({
  tube,
  allTubes,
  groupId,
  variant = 'return',
  onConfirm
}: ReturnToFreezerDialogProps) {
  const [open, setOpen] = useState(false)
  const [showCreateBox, setShowCreateBox] = useState(false)

  const originalFreezerId = tube.box?.freezer.id ?? null
  const originalBoxId = tube.boxId ?? null
  const suggestedCell =
    tube.row !== null && tube.column !== null ? { row: tube.row, col: tube.column } : null

  const [selectedFreezerId, setSelectedFreezerId] = useState<string | null>(originalFreezerId)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(originalBoxId)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(
    suggestedCell
  )
  const [experimentNotes, setExperimentNotes] = useState('')

  const { data: freezers = [] } = useQuery({
    queryKey: ['group-freezers', groupId],
    queryFn: () => getGroupFreezers(groupId),
    enabled: open
  })

  const { data: otherCells = [] } = useQuery({
    queryKey: ['box-occupancy', selectedBoxId, tube.sampleId],
    queryFn: () => getBoxOccupancy(selectedBoxId ?? '', tube.sampleId),
    enabled: open && !!selectedBoxId
  })

  useEffect(() => {
    if (open) {
      setSelectedFreezerId(originalFreezerId)
      setSelectedBoxId(originalBoxId)
      setSelectedCell(suggestedCell)
      setExperimentNotes('')
    }
  }, [open, originalFreezerId, originalBoxId, suggestedCell])

  const currentFreezer = freezers.find(f => f.id === selectedFreezerId) ?? null
  const currentBox = currentFreezer?.boxes.find(b => b.id === selectedBoxId) ?? null

  function handleFreezerChange(freezerId: string) {
    setSelectedFreezerId(freezerId)
    const firstBox = freezers.find(f => f.id === freezerId)?.boxes[0] ?? null
    setSelectedBoxId(firstBox?.id ?? null)
    setSelectedCell(null)
  }

  function handleBoxChange(boxId: string) {
    setSelectedBoxId(boxId)
    setSelectedCell(boxId === originalBoxId ? suggestedCell : null)
  }

  function handleConfirm() {
    if (!selectedCell || !selectedBoxId || !selectedFreezerId) return
    onConfirm({
      row: selectedCell.row,
      col: selectedCell.col,
      boxId: selectedBoxId,
      freezerId: selectedFreezerId,
      experimentNotes
    })
    setOpen(false)
  }

  const isOriginalBox = selectedBoxId === originalBoxId
  const tubesInBox = allTubes.filter(
    t => t.id !== tube.id && t.status === 'in_storage' && t.boxId === selectedBoxId
  )
  const selectedLabel = selectedCell ? positionLabel(selectedCell.row, selectedCell.col) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          {variant === 'place' ? (
            <Package className='size-3.5' />
          ) : (
            <ArrowDownToLine className='size-3.5' />
          )}
          {variant === 'place' ? 'Place in Storage' : 'Return to Freezer'}
        </Button>
      </DialogTrigger>

      <DialogContent className='flex w-215 sm:max-w-none flex-col gap-0 p-0'>
        <DialogHeader className='px-6 pt-5 pb-4'>
          <DialogTitle>
            {variant === 'place' ? 'Place Tube in Storage' : 'Return Tube to Freezer'}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <CreateBoxForGroupDialog groupId={groupId} open={showCreateBox} onOpenChange={setShowCreateBox} initialFreezerId={selectedFreezerId ?? undefined} />

        <div className='flex min-h-0 flex-1'>
          <ReturnToFreezerControls
            freezers={freezers}
            currentFreezer={currentFreezer}
            selectedFreezerId={selectedFreezerId}
            selectedBoxId={selectedBoxId}
            experimentNotes={experimentNotes}
            onFreezerChange={handleFreezerChange}
            onBoxChange={handleBoxChange}
            onNotesChange={setExperimentNotes}
            onNewBox={() => setShowCreateBox(true)}
          />

          <div className='basis-3/5 min-w-0 overflow-x-auto px-6 py-5'>
            {selectedBoxId ? (
              <ReturnPositionGrid
                tubesInBox={tubesInBox}
                otherCells={otherCells}
                selectedCell={selectedCell}
                onCellSelect={setSelectedCell}
                suggestedCell={isOriginalBox ? suggestedCell : null}
                boxLabel={currentBox?.label}
              />
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                Select a freezer and box to view the tray.
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className='flex items-center justify-between px-6 py-4'>
          <p className='text-sm text-muted-foreground'>
            {selectedLabel ? (
              <>
                Returning to{' '}
                <code className='font-mono font-medium text-foreground'>{selectedLabel}</code>
              </>
            ) : (
              'Select a position on the tray'
            )}
          </p>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size='sm'
              disabled={!selectedCell || !selectedBoxId}
              onClick={handleConfirm}
              className='gap-2'
            >
              <ArrowDownToLine className='size-3.5' />
              Confirm Return
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
