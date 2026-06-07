import { FreezerFormDialog } from '@/components/freezer-form-dialog'
import { FreezersTable } from '@/components/freezers-table/freezers-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { usePageTitle } from '@/hooks/use-page-title'
import { getApiErrorMessage } from '@/lib/api/api-error'
import {
  type CreateFreezerPayload,
  type Freezer,
  archiveFreezer,
  createFreezer,
  updateFreezer
} from '@/lib/api/get-freezers'
import { queryClient } from '@/lib/api/query-client'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/app/admin/freezers/')({
  component: RouteComponent
})

function RouteComponent() {
  usePageTitle('Freezers')

  const [showCreate, setShowCreate] = useState(false)
  const [editingFreezer, setEditingFreezer] = useState<Freezer | null>(null)
  const [archivingFreezer, setArchivingFreezer] = useState<Freezer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invalidate = () => {
    setError(null)
    queryClient.invalidateQueries({ queryKey: ['freezers'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateFreezerPayload) => createFreezer(data),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFreezerPayload }) =>
      updateFreezer(id, data),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveFreezer(id),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  return (
    <>
      <FreezerFormDialog
        mode='create'
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={data => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      {editingFreezer && (
        <FreezerFormDialog
          mode='edit'
          open={!!editingFreezer}
          onOpenChange={open => {
            if (!open) setEditingFreezer(null)
          }}
          initialData={{
            name: editingFreezer.name,
            roomId: editingFreezer.roomId
          }}
          onSubmit={data => updateMutation.mutate({ id: editingFreezer.id, data })}
          isPending={updateMutation.isPending}
        />
      )}

      <Dialog
        open={!!archivingFreezer}
        onOpenChange={open => {
          if (!open) setArchivingFreezer(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive freezer?</DialogTitle>
            <DialogDescription>
              Freezer <strong>{archivingFreezer?.name}</strong> in{' '}
              <strong>
                Room {archivingFreezer?.room.number}, Building {archivingFreezer?.room.building} —
                Floor {archivingFreezer?.room.floor}
              </strong>{' '}
              will be archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setArchivingFreezer(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={archiveMutation.isPending}
              onClick={() => {
                if (archivingFreezer) {
                  archiveMutation.mutate(archivingFreezer.id)
                  setArchivingFreezer(null)
                }
              }}
            >
              Archive freezer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold'>Freezers</h1>

        {error && (
          <p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>{error}</p>
        )}

        <FreezersTable
          onNewFreezer={() => setShowCreate(true)}
          onEditFreezer={freezer => setEditingFreezer(freezer)}
          onArchiveFreezer={freezer => setArchivingFreezer(freezer)}
        />
      </div>
    </>
  )
}
