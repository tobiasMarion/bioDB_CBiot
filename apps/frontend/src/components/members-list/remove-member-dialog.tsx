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
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{member?.user.name}</strong> from this group?
            They will need a new invite to rejoin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='ghost' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
