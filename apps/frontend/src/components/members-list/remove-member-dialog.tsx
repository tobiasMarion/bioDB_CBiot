import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { GroupMember } from '@/lib/api/get-group-members'
import { Loader2 } from 'lucide-react'

interface RemoveMemberDialogProps {
  member: GroupMember | null
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

export function RemoveMemberDialog({
  member,
  onConfirm,
  onCancel,
  isPending
}: RemoveMemberDialogProps) {
  return (
    <Dialog
      open={!!member}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription className='leading-snug'>
            Are you sure you want to remove{' '}
            <span className='font-medium text-foreground'>{member?.user.name}</span> from this
            group? They will need a new invite to rejoin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0 mt-2'>
          <Button variant='ghost' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Removing...
              </>
            ) : (
              'Remove member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
