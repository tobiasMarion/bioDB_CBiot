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
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteSampleDialogProps {
  sampleName: string
  onDelete: () => void
}

export function DeleteSampleDialog({ sampleName, onDelete }: DeleteSampleDialogProps) {
  const [open, setOpen] = useState(false)

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
            archived. Administrators can review this action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() => {
              onDelete()
              setOpen(false)
            }}
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
