import { createNewGroup } from '@/lib/api/create-group'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'

interface CreateGroupFormProps {
  onCancel: () => void
  onSuccess: (groupId: string, groupName: string) => void
}

export function CreateGroupForm({ onCancel, onSuccess }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { mutate: createGroup, isPending: isCreating } = useMutation({
    mutationFn: async (name: string) => createNewGroup({ name }),
    onSuccess: group => {
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      onSuccess(group.id, group.name)
    },
    onError: error => {
      console.error('Failed to create the group:', error)
      setErrorMessage('Unable to create the group. Please try again later.')
    }
  })

  function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createGroup(groupName)
  }

  return (
    <form onSubmit={handleCreateGroup}>
      <DialogHeader>
        <DialogTitle>Create Group</DialogTitle>
        <DialogDescription className='leading-snug'>
          Give a name to the new research group.
        </DialogDescription>
      </DialogHeader>

      <div className='py-6'>
        <div className='grid gap-2.5'>
          <Label htmlFor='group-name' className='text-sm font-medium'>
            Group Name
          </Label>
          <Input
            id='group-name'
            placeholder='Ex: Genomics Laboratory'
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            disabled={isCreating}
            className='transition-colors focus-visible:ring-1'
          />
          {errorMessage && (
            <p className='mt-1 text-[13px] font-medium leading-none text-destructive'>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <DialogFooter className='gap-2 sm:gap-0'>
        <Button type='button' variant='ghost' onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button type='submit' disabled={!groupName.trim() || isCreating}>
          {isCreating ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Creating...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
