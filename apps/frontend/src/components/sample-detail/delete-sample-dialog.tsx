import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteSampleDialogProps {
  sampleName: string
  activeTubeCount: number
  onDelete: (reason: string) => void
}

export function DeleteSampleDialog({ sampleName, activeTubeCount, onDelete }: DeleteSampleDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const hasTubes = activeTubeCount > 0

  const handleDelete = () => {
    onDelete(reason.trim())
    setReason('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <DialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={hasTubes}
                  className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive'
                >
                  <Trash2 className='size-3' />
                  Archive
                </Button>
              </DialogTrigger>
            </span>
          </TooltipTrigger>
          {hasTubes && (
            <TooltipContent>
              {activeTubeCount === 1
                ? 'Archive the tube first'
                : `Archive all ${activeTubeCount} tubes first`}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive sample?</DialogTitle>
          <DialogDescription>
            <strong className='text-foreground'>{sampleName}</strong> will be archived. Provide a
            reason — it will be recorded in the audit log and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder='e.g., Degraded material, insufficient volume for analysis…'
          className='min-h-20 resize-none text-sm'
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={!reason.trim()}
            onClick={handleDelete}
          >
            Archive sample
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
