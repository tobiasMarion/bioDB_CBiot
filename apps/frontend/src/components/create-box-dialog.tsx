import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

interface BoxDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (label: string) => void
  initialLabel?: string
  isPending?: boolean
}

export function BoxDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialLabel,
  isPending = false
}: BoxDialogProps) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (open) {
      setLabel(mode === 'edit' && initialLabel ? initialLabel : '')
    }
  }, [open, mode, initialLabel])

  const handleSubmit = () => {
    if (!label.trim()) return
    onSubmit(label.trim())
    setLabel('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Box' : 'Edit Box'}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-2'>
          <Label htmlFor='label'>Box label</Label>
          <Input
            id='label'
            placeholder='e.g. BOX-20260501-FELIPEROSSONI'
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!label.trim() || isPending} onClick={handleSubmit}>
            {mode === 'create' ? 'Create box' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
