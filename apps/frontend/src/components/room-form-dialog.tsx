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
import { useEffect, useState } from 'react'

interface RoomFormData {
  number: string
  building: string
  floor: string
}

interface RoomFormDialogProps {
  mode: 'create' | 'edit'
  open?: boolean
  initialData?: { number: string; building: string; floor: number }
  onSubmit: (data: { number: string; building: string; floor: number }) => void
  onOpenChange?: (open: boolean) => void
  isPending?: boolean
  children?: React.ReactNode
}

export function RoomFormDialog({
  mode,
  open: controlledOpen,
  initialData,
  onSubmit,
  onOpenChange,
  isPending = false,
  children
}: RoomFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [form, setForm] = useState<RoomFormData>({
    number: '',
    building: '',
    floor: ''
  })

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  useEffect(() => {
    if (open && initialData) {
      setForm({
        number: initialData.number,
        building: initialData.building,
        floor: String(initialData.floor)
      })
    } else if (open && !initialData) {
      setForm({ number: '', building: '', floor: '' })
    }
  }, [open, initialData])

  const isFormValid = form.number.trim() && form.building.trim() && form.floor.trim()

  const handleSubmit = () => {
    if (!isFormValid) return
    onSubmit({
      number: form.number.trim(),
      building: form.building.trim(),
      floor: Number(form.floor)
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Room' : 'Edit Room'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Register a new room in the infrastructure.'
              : 'Update the room information.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='number'>Room number</Label>
            <Input
              id='number'
              placeholder='e.g. 215'
              value={form.number}
              onChange={e => setForm({ ...form, number: e.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='building'>Building</Label>
            <Input
              id='building'
              placeholder='e.g. 43421'
              value={form.building}
              onChange={e => setForm({ ...form, building: e.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='floor'>Floor</Label>
            <Input
              id='floor'
              type='number'
              placeholder='e.g. 2'
              value={form.floor}
              onChange={e => setForm({ ...form, floor: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!isFormValid || isPending} onClick={handleSubmit}>
            {mode === 'create' ? 'Create room' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
