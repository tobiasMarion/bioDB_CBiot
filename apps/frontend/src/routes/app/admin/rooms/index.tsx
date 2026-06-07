import { RoomFormDialog } from '@/components/room-form-dialog'
import { RoomsTable } from '@/components/rooms-table/rooms-table'
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
import { queryClient } from '@/lib/api/query-client'
import {
  archiveRoom,
  createRoom,
  updateRoom,
  type CreateRoomPayload,
  type Room
} from '@/lib/api/get-rooms'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/app/admin/rooms/')({
  component: RouteComponent
})

function RouteComponent() {
  usePageTitle('Rooms')

  const [showCreate, setShowCreate] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [archivingRoom, setArchivingRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invalidate = () => {
    setError(null)
    queryClient.invalidateQueries({ queryKey: ['rooms'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateRoomPayload) => createRoom(data),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoomPayload }) => updateRoom(id, data),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveRoom(id),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  return (
    <>
      <RoomFormDialog
        mode='create'
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={data => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      >
        <span />
      </RoomFormDialog>

      {editingRoom && (
        <RoomFormDialog
          mode='edit'
          open={!!editingRoom}
          onOpenChange={open => { if (!open) setEditingRoom(null) }}
          initialData={{
            number: editingRoom.number,
            building: editingRoom.building,
            floor: editingRoom.floor
          }}
          onSubmit={data => updateMutation.mutate({ id: editingRoom.id, data })}
          isPending={updateMutation.isPending}
        >
          <span />
        </RoomFormDialog>
      )}

      <Dialog
        open={!!archivingRoom}
        onOpenChange={open => { if (!open) setArchivingRoom(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive room?</DialogTitle>
            <DialogDescription>
              Room <strong>{archivingRoom?.number}</strong> in building{' '}
              <strong>{archivingRoom?.building}</strong> will be archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setArchivingRoom(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={archiveMutation.isPending}
              onClick={() => {
                if (archivingRoom) {
                  archiveMutation.mutate(archivingRoom.id)
                  setArchivingRoom(null)
                }
              }}
            >
              Archive room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold'>Rooms</h1>

        {error && (
          <p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            {error}
          </p>
        )}

        <RoomsTable
          onNewRoom={() => setShowCreate(true)}
          onEditRoom={room => setEditingRoom(room)}
          onArchiveRoom={room => setArchivingRoom(room)}
        />
      </div>
    </>
  )
}
