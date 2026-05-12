import { MOCK_FREEZERS, type Tube, positionLabel } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ArrowDownToLine } from 'lucide-react'
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
  otherCells: Array<{ row: number; col: number }>
  onConfirm: (position: ReturnPosition) => void
}

export function ReturnToFreezerDialog({
  tube,
  allTubes,
  otherCells,
  onConfirm
}: ReturnToFreezerDialogProps) {
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    if (open) {
      setSelectedFreezerId(originalFreezerId)
      setSelectedBoxId(originalBoxId)
      setSelectedCell(suggestedCell)
      setExperimentNotes('')
    }
  }, [open, originalFreezerId, originalBoxId, suggestedCell])

  const currentFreezer = MOCK_FREEZERS.find(f => f.id === selectedFreezerId) ?? null
  const currentBox = currentFreezer?.boxes.find(b => b.id === selectedBoxId) ?? null

  function handleFreezerChange(freezerId: string) {
    setSelectedFreezerId(freezerId)
    const firstBox = MOCK_FREEZERS.find(f => f.id === freezerId)?.boxes[0] ?? null
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
          <ArrowDownToLine className='size-3.5' />
          Return to Freezer
        </Button>
      </DialogTrigger>

      <DialogContent className='flex w-215 sm:max-w-none flex-col gap-0 p-0'>
        <DialogHeader className='px-6 pt-5 pb-4'>
          <DialogTitle>Return Tube to Freezer</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className='flex min-h-0 flex-1'>
          <ReturnToFreezerControls
            selectedFreezerId={selectedFreezerId}
            selectedBoxId={selectedBoxId}
            experimentNotes={experimentNotes}
            currentFreezer={currentFreezer}
            onFreezerChange={handleFreezerChange}
            onBoxChange={handleBoxChange}
            onNotesChange={setExperimentNotes}
          />

          <div className='basis-3/5 min-w-0 overflow-x-auto px-6 py-5'>
            {selectedBoxId ? (
              <ReturnPositionGrid
                tubesInBox={tubesInBox}
                otherCells={isOriginalBox ? otherCells : []}
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
