import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Freezer } from '@/lib/api/get-freezers'
import {
  type Box,
  archiveBox,
  createBox,
  getFreezerBoxes,
  updateBox,
} from '@/lib/api/boxes'
import { getApiErrorMessage } from '@/lib/api/api-error'
import { queryClient } from '@/lib/api/query-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BoxDialog } from '../create-box-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

interface FreezerRowProps {
  freezer: Freezer
  onEdit: (freezer: Freezer) => void
  onArchive: (freezer: Freezer) => void
}

export function FreezerRow({ freezer, onEdit, onArchive }: FreezerRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showCreateBox, setShowCreateBox] = useState(false)
  const [editingBox, setEditingBox] = useState<Box | null>(null)
  const [archivingBox, setArchivingBox] = useState<Box | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: boxes = [] } = useQuery({
    queryKey: ['freezer-boxes', freezer.id],
    queryFn: () => getFreezerBoxes(freezer.id),
    enabled: expanded
  })

  const invalidate = () => {
    setError(null)
    queryClient.invalidateQueries({ queryKey: ['freezer-boxes', freezer.id] })
  }

  const createBoxMutation = useMutation({
    mutationFn: (label: string) => createBox(freezer.id, { label }),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const updateBoxMutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => updateBox(id, { label }),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  const archiveBoxMutation = useMutation({
    mutationFn: (id: string) => archiveBox(id),
    onSuccess: invalidate,
    onError: async err => setError(await getApiErrorMessage(err))
  })

  return (
    <>
      <TableRow className='cursor-pointer' onClick={() => setExpanded(!expanded)}>
        <TableCell>
          <div className='flex items-center gap-2'>
            {expanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className='text-xs text-muted-foreground truncate max-w-16 block'>
                    {freezer.id.slice(0, 8)}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='font-mono text-xs'>{freezer.id}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
        <TableCell className='font-medium'>{freezer.name}</TableCell>
        <TableCell className='text-muted-foreground text-sm'>
          Room {freezer.room.number}, Building {freezer.room.building} — Floor {freezer.room.floor}
        </TableCell>
        <TableCell className='text-right'>
          <div className='flex items-center justify-end gap-1'>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1.5 text-xs text-muted-foreground'
              onClick={e => { e.stopPropagation(); onEdit(freezer) }}
            >
              <Pencil className='size-3' />
              Edit
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive'
              onClick={e => { e.stopPropagation(); onArchive(freezer) }}
            >
              <Trash2 className='size-3' />
              Archive
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={4} className='bg-muted/30 p-0'>
            <div className='px-6 py-3'>
              {error && (
                <p className='mb-2 rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive'>
                  {error}
                </p>
              )}
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-medium text-muted-foreground'>Boxes</span>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 gap-1.5 text-xs'
                  onClick={() => setShowCreateBox(true)}
                >
                  <Plus className='size-3' />
                  New Box
                </Button>
              </div>
              {boxes.length === 0 ? (
                <p className='py-2 text-xs text-muted-foreground'>No boxes in this freezer.</p>
              ) : (
                <div className='divide-y rounded-md border'>
                  {boxes.map(box => (
                    <div key={box.id} className='flex items-center justify-between px-3 py-2'>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-medium'>{box.label}</span>
                        <span className='text-xs text-muted-foreground'>
                          {box._count.tubes} {box._count.tubes === 1 ? 'tube' : 'tubes'}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 gap-1 text-xs text-muted-foreground'
                          onClick={() => setEditingBox(box)}
                        >
                          <Pencil className='size-3' />
                          Edit
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 gap-1 text-xs text-muted-foreground hover:text-destructive'
                          onClick={() => setArchivingBox(box)}
                        >
                          <Trash2 className='size-3' />
                          Archive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}

      <BoxDialog
        mode='create'
        open={showCreateBox}
        onOpenChange={setShowCreateBox}
        onSubmit={label => createBoxMutation.mutate(label)}
        isPending={createBoxMutation.isPending}
      />

      {editingBox && (
        <BoxDialog
          mode='edit'
          open={!!editingBox}
          onOpenChange={open => { if (!open) setEditingBox(null) }}
          initialLabel={editingBox.label}
          onSubmit={label => updateBoxMutation.mutate({ id: editingBox.id, label })}
          isPending={updateBoxMutation.isPending}
        />
      )}

      <Dialog
        open={!!archivingBox}
        onOpenChange={open => { if (!open) setArchivingBox(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive box?</DialogTitle>
            <DialogDescription>
              Box <strong>{archivingBox?.label}</strong> will be archived.
              {archivingBox && archivingBox._count.tubes > 0 && (
                <span className='block mt-1 text-destructive'>
                  This box contains {archivingBox._count.tubes} active{' '}
                  {archivingBox._count.tubes === 1 ? 'tube' : 'tubes'}.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setArchivingBox(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={archiveBoxMutation.isPending}
              onClick={() => {
                if (archivingBox) {
                  archiveBoxMutation.mutate(archivingBox.id)
                  setArchivingBox(null)
                }
              }}
            >
              Archive box
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
