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
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteTubeDialogProps {
  onDelete: (reason: string) => void
}

export function DeleteTubeDialog({ onDelete }: DeleteTubeDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleDelete = () => {
    onDelete(reason.trim())
    setReason('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive'
        >
          <Trash2 className='size-3' />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tube?</DialogTitle>
          <DialogDescription>
            Provide a reason for deletion. It will be recorded in the audit log and cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder='e.g., Expired material, contamination detected, sample degraded…'
          className='min-h-20 resize-none text-sm'
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' disabled={!reason.trim()} onClick={handleDelete}>
            Delete tube
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
