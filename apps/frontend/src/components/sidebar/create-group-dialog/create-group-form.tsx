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
        <DialogDescription>Give a name to the new bioDB research group.</DialogDescription>
      </DialogHeader>

      <div className='py-4'>
        <div className='grid gap-2'>
          <Label htmlFor='group-name'>Group Name</Label>
          <Input
            id='group-name'
            placeholder='Ex: Genomics Laboratory'
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            disabled={isCreating}
          />
          {errorMessage && <p className='text-sm text-red-500 mt-1 font-medium'>{errorMessage}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button type='submit' disabled={!groupName.trim() || isCreating}>
          {isCreating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
