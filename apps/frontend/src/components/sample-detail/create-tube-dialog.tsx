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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface CreateTubeDialogProps {
  onSubmit: (data: { expirationDate: string | null; daysBeforeNotification?: number }) => void
}

export function CreateTubeDialog({ onSubmit }: CreateTubeDialogProps) {
  const [open, setOpen] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [daysBeforeNotification, setDaysBeforeNotification] = useState('')

  const handleSubmit = () => {
    const days = Number(daysBeforeNotification)
    onSubmit({
      expirationDate: expirationDate || null,
      daysBeforeNotification: daysBeforeNotification && days > 0 ? days : undefined
    })
    setExpirationDate('')
    setDaysBeforeNotification('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-2'>
          <Plus className='size-4' />
          New Tube
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New tube</DialogTitle>
          <DialogDescription>
            Add a new tube to this sample. You can assign it to a storage box later.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='expiration-date'>Expiration date</Label>
          <Input
            id='expiration-date'
            type='date'
            value={expirationDate}
            onChange={e => setExpirationDate(e.target.value)}
          />
          <p className='text-xs text-muted-foreground'>
            Leave blank if there is no expiration date.
          </p>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='days-before-notification'>Notify before expiration (days)</Label>
          <Input
            id='days-before-notification'
            type='number'
            min={1}
            value={daysBeforeNotification}
            onChange={e => setDaysBeforeNotification(e.target.value)}
            placeholder='1'
          />
          <p className='text-xs text-muted-foreground'>
            How many days before the expiration date to send a notification. Defaults to 1.
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create tube</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
