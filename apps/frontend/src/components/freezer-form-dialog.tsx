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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getRooms } from '@/lib/api/get-rooms'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface FreezerFormData {
  name: string
  roomId: string
}

interface FreezerFormDialogProps {
  mode: 'create' | 'edit'
  open?: boolean
  initialData?: { name: string; roomId: string }
  onSubmit: (data: { name: string; roomId: string }) => void
  onOpenChange?: (open: boolean) => void
  isPending?: boolean
  children?: React.ReactNode
}

export function FreezerFormDialog({
  mode,
  open: controlledOpen,
  initialData,
  onSubmit,
  onOpenChange,
  isPending = false,
  children
}: FreezerFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [form, setForm] = useState<FreezerFormData>({
    name: '',
    roomId: ''
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

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: open
  })

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name,
        roomId: initialData.roomId
      })
    } else if (open && !initialData) {
      setForm({ name: '', roomId: '' })
    }
  }, [open, initialData])

  const isFormValid = form.name.trim().length >= 3 && form.roomId !== ''

  const handleSubmit = () => {
    if (!isFormValid) return
    onSubmit({ name: form.name.trim(), roomId: form.roomId })
    setOpen(false)
  }

  const selectedRoom = rooms.find(r => r.id === form.roomId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Freezer' : 'Edit Freezer'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Register a new freezer in the infrastructure.'
              : 'Update the freezer information.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Freezer name</Label>
            <Input
              id='name'
              placeholder='e.g. Ultra-low -80'
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='room'>Room</Label>
            <Select
              value={form.roomId}
              onValueChange={value => setForm({ ...form, roomId: value })}
            >
              <SelectTrigger id='room' className='w-full'>
                <SelectValue placeholder='Select a room…'>
                  {selectedRoom
                    ? `Room ${selectedRoom.number}, Building ${selectedRoom.building} — Floor ${selectedRoom.floor}`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.number}, Building {room.building} — Floor {room.floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!isFormValid || isPending} onClick={handleSubmit}>
            {mode === 'create' ? 'Create freezer' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
