import { getAllUsers } from '@/lib/api/get-all-users'
import { sendGroupInvite } from '@/lib/api/send-invite'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
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

  function handleInviteLeader(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!groupId || !selectedLeaderId) return
    assignLeader({ groupId, leaderId: selectedLeaderId })
  }

  return (
    <form onSubmit={handleInviteLeader}>
      <DialogHeader>
        <DialogTitle>Assign Leader</DialogTitle>
        <DialogDescription>
          Select the lead researcher for the group <strong>{groupName}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className='py-4'>
        <div className='grid gap-2'>
          <Label>Researcher (Leader)</Label>
          <Popover open={leaderPopoverOpen} onOpenChange={setLeaderPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                aria-expanded={leaderPopoverOpen}
                className='w-full justify-between font-normal px-3'
                disabled={isInviting || isLoadingResearchers}
              >
                <span className='truncate'>
                  {isLoadingResearchers
                    ? 'Loading researchers...'
                    : selectedLeader
                      ? selectedLeader.name
                      : 'Select researcher...'}
                </span>
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align='start'
              sideOffset={4}
              style={{ width: 'var(--radix-popover-trigger-width)' }}
              className='p-0 border-none'
            >
              <Command className='w-full border shadow-md'>
                <CommandInput placeholder='Search researcher...' className='h-9 w-full' />
                <CommandList className='max-h-75 overflow-y-auto w-full'>
                  <CommandEmpty>No researcher found.</CommandEmpty>
                  <CommandGroup>
                    {researchers.map(researcher => (
                      <CommandItem
                        key={researcher.id}
                        value={`${researcher.name} ${researcher.email}`}
                        onSelect={() => {
                          setSelectedLeaderId(researcher.id)
                          setLeaderPopoverOpen(false)
                        }}
                        className='cursor-pointer'
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedLeaderId === researcher.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className='flex flex-col overflow-hidden'>
                          <span className='font-medium truncate'>{researcher.name}</span>
                          <span className='text-xs text-muted-foreground truncate'>
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
          {errorMessage && <p className='text-sm text-red-500 mt-1 font-medium'>{errorMessage}</p>}
        </div>
      </div>

      <DialogFooter>
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
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
