import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api/api-error'
import { createSample } from '@/lib/api/create-sample'
import { getSamplesTypes } from '@/lib/api/get-samples-types'
import { queryClient } from '@/lib/api/query-client'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

interface CreateSampleDialogProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSampleDialog({ groupId, open, onOpenChange }: CreateSampleDialogProps) {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [typeInput, setTypeInput] = useState('')
  const [originOrganism, setOriginOrganism] = useState('')
  const [sourceLab, setSourceLab] = useState('')
  const [observations, setObservations] = useState('')
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: existingTypes = [] } = useQuery({
    queryKey: ['samples-types', groupId],
    queryFn: () => getSamplesTypes(groupId),
    enabled: open
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createSample(groupId, {
        name: name.trim(),
        type: type.trim(),
        originOrganism: originOrganism.trim(),
        sourceLab: sourceLab.trim(),
        observations: observations.trim() || undefined
      }),
    onSuccess: sample => {
      queryClient.invalidateQueries({ queryKey: ['samples', groupId] })
      onOpenChange(false)
      navigate({ to: '/app/$groupId/samples/$id', params: { groupId, id: sample.id } })
    },
    onError: async err => {
      setError(await getApiErrorMessage(err))
    }
  })

  function handleOpenChange(value: boolean) {
    if (!value) {
      setName('')
      setType('')
      setTypeInput('')
      setOriginOrganism('')
      setSourceLab('')
      setObservations('')
      setError(null)
    }
    onOpenChange(value)
  }

  const isValid = name.trim() && type.trim() && originOrganism.trim() && sourceLab.trim()
  const filteredTypes = existingTypes.filter(t =>
    t.toLowerCase().includes(typeInput.toLowerCase())
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setError(null)
    mutate()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>New Sample</DialogTitle>
          <DialogDescription>
            Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name <span className='text-destructive'>*</span></Label>
            <Input
              id='name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='e.g. Bacterial Culture 01'
              disabled={isPending}
            />
          </div>

          <div className='grid gap-2'>
            <Label>Type <span className='text-destructive'>*</span></Label>
            <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full justify-between font-normal px-3'
                  disabled={isPending}
                >
                  <span className='truncate'>{type || 'Select or type a new type...'}</span>
                  <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align='start'
                sideOffset={4}
                style={{ width: 'var(--radix-popover-trigger-width)' }}
                className='p-0 border-none'
              >
                <Command className='w-full border shadow-md'>
                  <CommandInput
                    placeholder='Search or type new...'
                    value={typeInput}
                    onValueChange={setTypeInput}
                    className='h-9'
                  />
                  <CommandList className='max-h-48 overflow-y-auto'>
                    <CommandEmpty>No types found.</CommandEmpty>
                    <CommandGroup>
                      {filteredTypes.map(t => (
                        <CommandItem
                          key={t}
                          value={t}
                          onSelect={() => {
                            setType(t)
                            setTypeInput(t)
                            setTypePopoverOpen(false)
                          }}
                          className='cursor-pointer'
                        >
                          <Check
                            className={cn('mr-2 size-4', type === t ? 'opacity-100' : 'opacity-0')}
                          />
                          {t}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {typeInput && !existingTypes.some(t => t.toLowerCase() === typeInput.toLowerCase()) && (
                      <CommandGroup>
                        <CommandItem
                          value={`__new__${typeInput}`}
                          onSelect={() => {
                            setType(typeInput)
                            setTypePopoverOpen(false)
                          }}
                          className='cursor-pointer font-medium'
                        >
                          <Plus className='mr-2 size-4 text-muted-foreground' />
                          {`Use "${typeInput}"`}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='originOrganism'>Origin Organism <span className='text-destructive'>*</span></Label>
            <Input
              id='originOrganism'
              value={originOrganism}
              onChange={e => setOriginOrganism(e.target.value)}
              placeholder='e.g. Escherichia coli'
              disabled={isPending}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='sourceLab'>Source Lab <span className='text-destructive'>*</span></Label>
            <Input
              id='sourceLab'
              value={sourceLab}
              onChange={e => setSourceLab(e.target.value)}
              placeholder='e.g. Microbiology Research Lab'
              disabled={isPending}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='observations'>Observations</Label>
            <Textarea
              id='observations'
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder='Optional notes about this sample...'
              disabled={isPending}
              rows={3}
            />
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex justify-end gap-3 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!isValid || isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Sample'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
