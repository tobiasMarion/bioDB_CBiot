import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getGroupFreezers } from '@/lib/api/get-group-freezers'
import { createBox } from '@/lib/api/boxes'
import { getApiErrorMessage } from '@/lib/api/api-error'
import { queryClient } from '@/lib/api/query-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CreateBoxForGroupDialogProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBoxForGroupDialog({ groupId, open, onOpenChange }: CreateBoxForGroupDialogProps) {
  const [freezerId, setFreezerId] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: freezers = [] } = useQuery({
    queryKey: ['group-freezers', groupId],
    queryFn: () => getGroupFreezers(groupId),
    enabled: open
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () => createBox(freezerId, { label: label.trim(), groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-freezers', groupId] })
      setSuccess(true)
    },
    onError: async err => setError(await getApiErrorMessage(err))
  })

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => handleOpenChange(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [success])

  function handleOpenChange(value: boolean) {
    if (!value) {
      setFreezerId('')
      setLabel('')
      setError(null)
      setSuccess(false)
    }
    onOpenChange(value)
  }

  const isValid = label.trim() && freezerId

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setError(null)
    mutate()
  }

  const selectedFreezer = freezers.find(f => f.id === freezerId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>New Box</DialogTitle>
          <DialogDescription>Create a new box in a freezer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='freezer'>Freezer <span className='text-destructive'>*</span></Label>
            <Select value={freezerId} onValueChange={setFreezerId} disabled={isPending}>
              <SelectTrigger id='freezer'>
                <SelectValue placeholder='Select a freezer…' />
              </SelectTrigger>
              <SelectContent>
                {freezers.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} — Room {f.room.number}, Building {f.room.building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFreezer && (
              <p className='text-xs text-muted-foreground'>
                {selectedFreezer.boxes.length} box{selectedFreezer.boxes.length !== 1 ? 'es' : ''} in this freezer
              </p>
            )}
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='label'>Box label <span className='text-destructive'>*</span></Label>
            <Input
              id='label'
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='e.g. BOX-20260501-FELIPEROSSONI'
              disabled={isPending}
            />
          </div>

          {success && (
            <p className='flex items-center gap-2 text-sm text-emerald-600'>
              <CheckCircle2 className='size-4' />
              Box created successfully!
            </p>
          )}
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex justify-end gap-3 pt-2'>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type='submit' disabled={!isValid || isPending || success}>
              {isPending ? <><Loader2 className='mr-2 size-4 animate-spin' />Creating...</> : success ? 'Created' : 'Create Box'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
