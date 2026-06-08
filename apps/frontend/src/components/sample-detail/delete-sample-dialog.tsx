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

interface DeleteSampleDialogProps {
  sampleName: string
  onDelete: (reason: string) => void
}

export function DeleteSampleDialog({ sampleName, onDelete }: DeleteSampleDialogProps) {
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
          Archive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive sample?</DialogTitle>
          <DialogDescription>
            <strong className='text-foreground'>{sampleName}</strong> and all its tubes will be
            archived. Provide a reason — it will be recorded in the audit log and cannot be undone.
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
