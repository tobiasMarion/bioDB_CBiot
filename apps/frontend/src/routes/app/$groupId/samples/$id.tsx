import type { Attribute, Role } from '@/components/attributes/types'
import { CreateTubeDialog } from '@/components/sample-detail/create-tube-dialog'
import { EmptyTubeState } from '@/components/sample-detail/empty-tube-state'
import type { ReturnPosition } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import { SampleCard } from '@/components/sample-detail/sample-card'
import { SampleCardSkeleton } from '@/components/sample-detail/sample-card-skeleton'
import { TubeDetail } from '@/components/sample-detail/tube-detail/tube-detail'
import { type Tube, type TubeAttribute, positionLabel } from '@/components/tube/tube-data'
import { TubeSelector } from '@/components/tube/tube-selector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { usePageTitle } from '@/hooks/use-page-title'
import type { AddTubeAttributePayload } from '@/lib/api/add-tube-attribute'
import { addTubeAttribute } from '@/lib/api/add-tube-attribute'
import { getApiErrorMessage } from '@/lib/api/api-error'
import { archiveSample } from '@/lib/api/archive-sample'
import { checkinTube } from '@/lib/api/checkin-tube'
import { checkoutTube } from '@/lib/api/checkout-tube'
import { createTube } from '@/lib/api/create-tube'
import { deleteTube } from '@/lib/api/delete-tube'
import { deleteTubeAttribute } from '@/lib/api/delete-tube-attribute'
import { getGroupMembers } from '@/lib/api/get-group-members'
import { getSample } from '@/lib/api/get-sample'
import { getSampleTubes } from '@/lib/api/get-sample-tubes'
import { queryClient } from '@/lib/api/query-client'
import { updateTube } from '@/lib/api/update-tube'
import { updateTubeAttribute } from '@/lib/api/update-tube-attribute'
import { authStore } from '@/lib/auth/store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/app/$groupId/samples/$id')({
  component: RouteComponent
})

function toAttribute(attr: TubeAttribute): Attribute {
  const value =
    attr.type === 'number'
      ? Number(attr.value)
      : attr.type === 'boolean'
        ? attr.value === 'true'
        : attr.value
  return {
    key: attr.key,
    label: attr.label ?? attr.key,
    value,
    type: attr.type,
    minRole: attr.minRequiredRoleToEdit
  }
}

function serializeAttrValue(value: Attribute['value']): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function RouteComponent() {
  const { groupId, id } = useParams({ from: '/app/$groupId/samples/$id' })
  const navigate = useNavigate()
  const user = authStore.getUser()

  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(null)
  const [tubeError, setTubeError] = useState<string | null>(null)
  const [attrError, setAttrError] = useState<string | null>(null)

  const { data: sample, isLoading } = useQuery({
    queryKey: ['sample', id],
    queryFn: () => getSample(id)
  })

  const { data: tubes = [] } = useQuery({
    queryKey: ['sample-tubes', id],
    queryFn: () => getSampleTubes(id),
    enabled: !!id
  })

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !user?.isAdmin
  })

  usePageTitle(sample?.name)

  const currentMember = members.find(m => m.user.id === user?.id && !m.isArchived)
  const userRole: Role = user?.isAdmin ? 'LEADER' : (currentMember?.role ?? 'RESEARCHER')

  const sampleQueryKeys = [
    ['sample', id],
    ['sample-tubes', id],
    ['samples', groupId]
  ]

  const invalidateSample = () =>
    Promise.all(sampleQueryKeys.map(key => queryClient.invalidateQueries({ queryKey: key })))

  const checkoutMutation = useMutation({
    mutationFn: (tubeId: string) => checkoutTube(tubeId),
    onSuccess: () => {
      setTubeError(null)
      queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] })
    },
    onError: async err => setTubeError(await getApiErrorMessage(err))
  })

  const checkinMutation = useMutation({
    mutationFn: ({ tubeId, position }: { tubeId: string; position: ReturnPosition }) =>
      checkinTube(tubeId, {
        boxId: position.boxId,
        row: position.row,
        col: position.col,
        notes: position.experimentNotes || undefined
      }),
    onSuccess: () => {
      setTubeError(null)
      queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] })
      queryClient.invalidateQueries({ queryKey: ['box-occupancy'] })
    },
    onError: async err => setTubeError(await getApiErrorMessage(err))
  })

  const createTubeMutation = useMutation({
    mutationFn: (data: { expirationDate: string | null }) =>
      createTube(id, { expirationDate: data.expirationDate ?? undefined }),
    onSuccess: () => {
      setTubeError(null)
      invalidateSample()
    },
    onError: async err => setTubeError(await getApiErrorMessage(err))
  })

  const deleteTubeMutation = useMutation({
    mutationFn: (tubeId: string) => deleteTube(tubeId),
    onSuccess: () => {
      setTubeError(null)
      setSelectedTubeId(null)
      invalidateSample()
    },
    onError: async err => setTubeError(await getApiErrorMessage(err))
  })

  const archiveSampleMutation = useMutation({
    mutationFn: () => archiveSample(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples', groupId] })
      navigate({ to: '/app/$groupId/samples', params: { groupId } })
    },
    onError: async err => setTubeError(await getApiErrorMessage(err))
  })

  const addAttrMutation = useMutation({
    mutationFn: ({ tubeId, payload }: { tubeId: string; payload: AddTubeAttributePayload }) =>
      addTubeAttribute(tubeId, payload),
    onSuccess: () => {
      setAttrError(null)
      queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] })
    },
    onError: async err => setAttrError(await getApiErrorMessage(err))
  })

  const updateTubeMutation = useMutation({
    mutationFn: ({ tubeId, data }: { tubeId: string; data: { notes: string } }) =>
      updateTube(tubeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] }),
    onError: async err => setAttrError(await getApiErrorMessage(err))
  })

  const updateAttrMutation = useMutation({
    mutationFn: ({ tubeId, key, value }: { tubeId: string; key: string; value: string }) =>
      updateTubeAttribute(tubeId, key, value),
    onSuccess: () => {
      setAttrError(null)
      queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] })
    },
    onError: async err => setAttrError(await getApiErrorMessage(err))
  })

  const deleteAttrMutation = useMutation({
    mutationFn: ({ tubeId, key }: { tubeId: string; key: string }) =>
      deleteTubeAttribute(tubeId, key),
    onSuccess: () => {
      setAttrError(null)
      queryClient.invalidateQueries({ queryKey: ['sample-tubes', id] })
    },
    onError: async err => setAttrError(await getApiErrorMessage(err))
  })

  const selectedTube = tubes.find(t => t.id === selectedTubeId) ?? null
  const toggleTube = (tubeId: string) =>
    setSelectedTubeId(prev => (prev === tubeId ? null : tubeId))

  const isTubePending =
    checkoutMutation.isPending || checkinMutation.isPending || deleteTubeMutation.isPending

  const isOwner = sample ? sample.groupId === groupId : false
  const canEdit = true
  const canDelete = userRole === 'MANAGER' || userRole === 'LEADER'
  const canShare = isOwner && userRole === 'LEADER'

  function getAttrsForTube(tube: Tube): Attribute[] {
    return tube.attributes.map(toAttribute)
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='flex flex-col gap-6 px-5 py-6 lg:px-8'>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-2 w-fit gap-2 text-muted-foreground'
          asChild
        >
          <Link to='/app/$groupId/samples' params={{ groupId }}>
            <ArrowLeft className='size-4' />
            Back to Samples
          </Link>
        </Button>

        {isLoading ? (
          <SampleCardSkeleton />
        ) : sample ? (
          <SampleCard
            sample={sample}
            canEdit={canEdit}
            canDelete={canDelete}
            isOwner={isOwner}
            canShare={canShare}
            onDelete={() => archiveSampleMutation.mutate()}
          />
        ) : null}

        {tubeError && (
          <p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            {tubeError}
          </p>
        )}

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base'>Tubes</CardTitle>
              <Badge variant='secondary' className='tabular-nums'>
                {tubes.length}
              </Badge>
            </div>
            <CreateTubeDialog onSubmit={data => createTubeMutation.mutate(data)} />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]'>
              <div className='lg:sticky lg:top-6 lg:self-start'>
                <div className='lg:hidden'>
                  <Select
                    value={selectedTubeId ?? ''}
                    onValueChange={v => setSelectedTubeId(prev => (prev === v ? null : v))}
                  >
                    <SelectTrigger className='w-full bg-card'>
                      <SelectValue placeholder='Select a tube…' />
                    </SelectTrigger>
                    <SelectContent>
                      {tubes.map(tube => (
                        <SelectItem key={tube.id} value={tube.id}>
                          <span className='font-mono'>
                            {positionLabel(tube.row, tube.column) ?? 'Unplaced'}
                          </span>
                          {tube.box && (
                            <span className='ml-2 text-xs text-muted-foreground'>
                              {tube.box.label}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='hidden lg:block'>
                  <TubeSelector
                    tubes={tubes}
                    selectedId={selectedTubeId}
                    onSelect={t => toggleTube(t.id)}
                  />
                </div>
              </div>

              {selectedTube ? (
                <TubeDetail
                  tube={selectedTube}
                  allTubes={tubes}
                  groupId={groupId}
                  userRole={userRole}
                  currentUserId={user?.id ?? ''}
                  attributes={getAttrsForTube(selectedTube)}
                  notes={selectedTube.notes}
                  isPending={isTubePending}
                  onAttrChange={(key, value) =>
                    updateAttrMutation.mutate({
                      tubeId: selectedTube.id,
                      key,
                      value: serializeAttrValue(value)
                    })
                  }
                  onAttrAdd={attr =>
                    addAttrMutation.mutate({
                      tubeId: selectedTube.id,
                      payload: {
                        key: attr.key,
                        value: serializeAttrValue(attr.value),
                        type: attr.type,
                        minRequiredRoleToEdit: attr.minRole
                      }
                    })
                  }
                  onAttrDelete={key => deleteAttrMutation.mutate({ tubeId: selectedTube.id, key })}
                  onNotesChange={v =>
                    updateTubeMutation.mutate({ tubeId: selectedTube.id, data: { notes: v } })
                  }
                  onCheckout={() => checkoutMutation.mutate(selectedTube.id)}
                  onCheckin={pos =>
                    checkinMutation.mutate({ tubeId: selectedTube.id, position: pos })
                  }
                  onDelete={_reason => deleteTubeMutation.mutate(selectedTube.id)}
                />
              ) : (
                <EmptyTubeState />
              )}
            </div>

            {attrError && (
              <p className='mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                {attrError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
