import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api/api-error'
import { type CreateShareRequest, createShareRequest } from '@/lib/api/create-share-request'
import type { SamplePermission } from '@/lib/api/get-notifications'
import { getShareTargets } from '@/lib/api/get-share-targets'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareSampleDialogProps {
  sampleId: string
  /** Omit to render the dialog with its own trigger button; pass to control it externally (e.g. from a table row action). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareSampleDialog({
  sampleId,
  open: openProp,
  onOpenChange: onOpenChangeProp
}: ShareSampleDialogProps) {
  const queryClient = useQueryClient()
  const isControlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen
  const [targetGroupId, setTargetGroupId] = useState('')
  const [permission, setPermission] = useState<SamplePermission>('VIEW')
  const [error, setError] = useState<string | null>(null)

  const { data: eligibleGroups = [] } = useQuery({
    queryKey: ['share-targets', sampleId],
    queryFn: () => getShareTargets(sampleId),
    enabled: open
  })

  const groupItems = eligibleGroups.map(g => ({ value: g.id, label: g.name }))
  const selectedGroupItem = groupItems.find(item => item.value === targetGroupId) ?? null

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: CreateShareRequest) => createShareRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setOpen(false)
      setTargetGroupId('')
      setPermission('VIEW')
      setError(null)
    },
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const handleSubmit = () => {
    if (!targetGroupId) return
    setError(null)
    submit({ sampleId, targetGroupId, permission })
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTargetGroupId('')
      setPermission('VIEW')
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground'
          >
            <Share2 className='size-3' />
            Share
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share sample</DialogTitle>
          <DialogDescription>
            Send a share request to another group. Their managers and leaders will be notified and
            can accept or reject access.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='target-group'>Target group</Label>
            {eligibleGroups.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No other groups available to share with.
              </p>
            ) : (
              <Combobox
                items={groupItems}
                value={selectedGroupItem}
                onValueChange={item => setTargetGroupId(item?.value ?? '')}
              >
                <ComboboxInput id='target-group' placeholder='Search groups…' />
                <ComboboxContent>
                  <ComboboxEmpty>No groups found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: { value: string; label: string }) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='permission'>Permission</Label>
            <Select value={permission} onValueChange={v => setPermission(v as SamplePermission)}>
              <SelectTrigger id='permission'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='VIEW'>View only — can see sample and tube data</SelectItem>
                <SelectItem value='EDIT'>Edit — can modify sample and tube data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!targetGroupId || isPending}>
            {isPending ? 'Sending…' : 'Send request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
