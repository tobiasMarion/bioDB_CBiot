import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent } from '../../ui/dialog'
import { CreateGroupForm } from './create-group-form'
import { AssignLeaderForm } from './assign-leader-form'

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [groupData, setGroupData] = useState({ id: '', name: '' })

  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setStep(1)
      setGroupData({ id: '', name: '' })
    }
  }, [open])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      if (groupData.id) {
        navigate({ to: `/app/${groupData.id}/samples` })
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-115'>
        {step === 1 ? (
          <CreateGroupForm
            onCancel={() => handleOpenChange(false)}
            onSuccess={(id, name) => {
              setGroupData({ id, name })
              setStep(2)
            }}
          />
        ) : (
          <AssignLeaderForm
            groupId={groupData.id}
            groupName={groupData.name}
            onFinish={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
