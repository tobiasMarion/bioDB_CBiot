import type { Attribute, Role } from '@/components/attributes/types'
import { CreateTubeDialog } from '@/components/sample-detail/create-tube-dialog'
import { EmptyTubeState } from '@/components/sample-detail/empty-tube-state'
import { SampleCard } from '@/components/sample-detail/sample-card'
import { SampleCardSkeleton } from '@/components/sample-detail/sample-card-skeleton'
import { TubeDetail } from '@/components/sample-detail/tube-detail'
import {
  MOCK_OTHER_CELLS,
  MOCK_TUBES,
  type Tube,
  type TubeAttribute,
  positionLabel
} from '@/components/tube-data'
import { TubeSelector } from '@/components/tube-selector'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SampleDetail } from '@/lib/api/get-sample'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/app/$groupId/samples/$id')({
  component: RouteComponent
})

const CURRENT_USER_ROLE: Role = 'MANAGER'

// TODO: replace with getSample(id) when GET /samples/:id endpoint exists
function mockSampleDetail(id: string, groupId: string): SampleDetail {
  return {
    id,
    name: 'RNA-seq Extract #42',
    type: 'RNA',
    originOrganism: 'Mus musculus',
    sourceLab: 'Genomics Lab B',
    groupId,
    group: { id: groupId, name: 'Biotechnology Center' },
    createdBy: 'user-001',
    creator: { id: 'user-001', name: 'Dr. Ana Souza', email: 'ana.souza@ufrgs.br' },
    createdAt: '2024-08-14T09:22:00Z',
    updatedAt: '2024-08-14T09:22:00Z',
    amountOfTubes: MOCK_TUBES.length
  }
}

function toAttribute(attr: TubeAttribute): Attribute {
  const value =
    attr.type === 'number'
      ? Number(attr.value)
      : attr.type === 'boolean'
        ? attr.value === 'true'
        : attr.value
  return {
    key: attr.key,
    label: attr.label,
    value,
    type: attr.type,
    minRole: attr.minRequiredRoleToEdit
  }
}

function RouteComponent() {
  const { groupId, id } = useParams({ from: '/app/$groupId/samples/$id' })

  const { data: sample, isLoading } = useQuery({
    queryKey: ['sample', id],
    // TODO: replace with getSample(id)
    queryFn: () =>
      new Promise<SampleDetail>(resolve =>
        setTimeout(() => resolve(mockSampleDetail(id, groupId)), 600)
      )
  })

  // TODO: replace with getSampleTubes(id) when endpoint exists
  const { data: tubes = [] } = useQuery({
    queryKey: ['sample-tubes', id],
    queryFn: () => new Promise<Tube[]>(resolve => setTimeout(() => resolve(MOCK_TUBES), 800))
  })

  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(null)
  const selectedTube = tubes.find(t => t.id === selectedTubeId) ?? null
  const toggleTube = (tubeId: string) =>
    setSelectedTubeId(prev => (prev === tubeId ? null : tubeId))

  const [tubeAttrsMap, setTubeAttrsMap] = useState<Record<string, Attribute[]>>({})

  function getAttrsForTube(tube: Tube): Attribute[] {
    return tubeAttrsMap[tube.id] ?? tube.attributes.map(toAttribute)
  }

  function updateAttr(tubeId: string, key: string, value: Attribute['value']) {
    setTubeAttrsMap(prev => {
      const current =
        prev[tubeId] ?? (tubes.find(t => t.id === tubeId)?.attributes ?? []).map(toAttribute)
      return { ...prev, [tubeId]: current.map(a => (a.key === key ? { ...a, value } : a)) }
    })
  }

  const isOwner = sample ? sample.groupId === groupId : false
  const canDelete = CURRENT_USER_ROLE === 'MANAGER' || CURRENT_USER_ROLE === 'LEADER'

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
            canEdit
            canDelete={canDelete}
            isOwner={isOwner}
            onDelete={() => console.log('archive', id)}
          />
        ) : null}

        <div className='rounded-xl border border-border bg-muted/40 p-5 lg:p-6'>
          <div className='mb-5 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <p className='text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                Tubes
              </p>
              <span className='flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground'>
                {tubes.length}
              </span>
            </div>
            {/* TODO: replace console.log with createTube(sample.id, data) when endpoint exists */}
            <CreateTubeDialog onSubmit={data => console.log('create tube', data)} />
          </div>

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
                selectedTubeId={selectedTubeId ?? ''}
                userRole={CURRENT_USER_ROLE}
                attributes={getAttrsForTube(selectedTube).filter(a => a.key !== 'notes')}
                notes={String(
                  getAttrsForTube(selectedTube).find(a => a.key === 'notes')?.value ?? ''
                )}
                onAttrChange={(key, value) => updateAttr(selectedTube.id, key, value)}
                onAttrAdd={attr =>
                  setTubeAttrsMap(prev => ({
                    ...prev,
                    [selectedTube.id]: [...getAttrsForTube(selectedTube), attr]
                  }))
                }
                onAttrDelete={key =>
                  setTubeAttrsMap(prev => ({
                    ...prev,
                    [selectedTube.id]: getAttrsForTube(selectedTube).filter(a => a.key !== key)
                  }))
                }
                onTubeSelect={toggleTube}
                onNotesChange={v => updateAttr(selectedTube.id, 'notes', v)}
                otherCells={MOCK_OTHER_CELLS}
              />
            ) : (
              <EmptyTubeState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
