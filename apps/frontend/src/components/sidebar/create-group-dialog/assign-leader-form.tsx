import { getAllUsers } from '@/lib/api/get-all-users'
import { sendGroupInvite } from '@/lib/api/send-invite'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { type SubmitEvent, useState } from 'react'
import { Button } from '../../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../../ui/command'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Label } from '../../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'

interface AssignLeaderFormProps {
  groupId: string
  groupName: string
  onFinish: () => void
}

interface User {
  id: string
  name: string
  email: string
}

export function AssignLeaderForm({ groupId, groupName, onFinish }: AssignLeaderFormProps) {
  const queryClient = useQueryClient()

  const [leaderPopoverOpen, setLeaderPopoverOpen] = useState(false)
  const [selectedLeaderId, setSelectedLeaderId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: researchers = [], isLoading: isLoadingResearchers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getAllUsers
  })

  const selectedLeader = researchers.find(item => item.id === selectedLeaderId) ?? null

  const { mutate: assignLeader, isPending: isInviting } = useMutation({
    mutationFn: (data: { groupId: string; leaderId: string }) =>
      sendGroupInvite({
        groupId: data.groupId,
        userId: data.leaderId,
        role: 'LEADER'
      }),
    onSuccess: () => {
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      onFinish()
    },
    onError: error => {
      console.error('Failed to assign leader:', error)
      setErrorMessage('Unable to assign the leader. Please try again later.')
    }
  })

  function handleInviteLeader(e: SubmitEvent) {
    e.preventDefault()

    if (!groupId || !selectedLeaderId) return
    assignLeader({ groupId, leaderId: selectedLeaderId })
  }

  return (
    <form onSubmit={handleInviteLeader}>
      <DialogHeader>
        <DialogTitle>Assign Leader</DialogTitle>
        <DialogDescription className='leading-snug'>
          Select the lead researcher for{' '}
          <span className='font-medium text-foreground'>{groupName}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className='py-6'>
        <div className='grid gap-2.5'>
          <Label className='text-sm font-medium'>Researcher (Leader)</Label>
          <Popover open={leaderPopoverOpen} onOpenChange={setLeaderPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                aria-expanded={leaderPopoverOpen}
                className='w-full justify-between px-3 font-normal transition-colors hover:bg-muted/50'
                disabled={isInviting || isLoadingResearchers}
              >
                <span className={cn('truncate', !selectedLeader && 'text-muted-foreground')}>
                  {isLoadingResearchers
                    ? 'Loading researchers...'
                    : selectedLeader
                      ? selectedLeader.name
                      : 'Select a researcher...'}
                </span>
                <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align='start'
              sideOffset={8}
              style={{ width: 'var(--radix-popover-trigger-width)' }}
              className='p-0 border rounded-lg shadow-lg'
            >
              <Command className='w-full'>
                <CommandInput placeholder='Search researcher...' className='h-10' />
                <CommandList className='max-h-60 overflow-y-auto p-1'>
                  <CommandEmpty className='py-6 text-center text-sm text-muted-foreground'>
                    No researcher found.
                  </CommandEmpty>
                  <CommandGroup>
                    {researchers.map(researcher => (
                      <CommandItem
                        key={researcher.id}
                        value={`${researcher.name} ${researcher.email}`}
                        onSelect={() => {
                          setSelectedLeaderId(researcher.id)
                          setLeaderPopoverOpen(false)
                        }}
                        className='flex cursor-pointer items-center gap-2.5 rounded-md p-2'
                      >
                        <div className='flex size-4 shrink-0 items-center justify-center'>
                          {selectedLeaderId === researcher.id && (
                            <Check className='size-4 text-primary' />
                          )}
                        </div>
                        <div className='grid flex-1 leading-tight'>
                          <span className='truncate font-medium'>{researcher.name}</span>
                          <span className='mt-0.5 truncate text-xs text-muted-foreground'>
                            {researcher.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errorMessage && (
            <p className='mt-1 text-[13px] font-medium leading-none text-destructive'>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <DialogFooter className='gap-2 sm:gap-0'>
        <Button
          type='button'
          variant='ghost'
          onClick={onFinish}
          disabled={isInviting || isLoadingResearchers}
        >
          Skip for now
        </Button>
        <Button type='submit' disabled={!selectedLeaderId || isInviting || isLoadingResearchers}>
          {isInviting ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Assigning...
            </>
          ) : (
            'Confirm'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
