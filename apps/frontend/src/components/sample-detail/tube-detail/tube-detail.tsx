import { AttributeList } from '@/components/attributes/attribute-list'
import type { Attribute, Role } from '@/components/attributes/types'
import type { ReturnPosition } from '@/components/sample-detail/return-to-freezer/return-to-freezer-dialog'
import {
  EXPIRATION_CONFIG,
  type Tube,
  daysUntilExpiration,
  expirationStatus,
  positionLabel
} from '@/components/tube/tube-data'
import { TubeTray } from '@/components/tube/tube-tray'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { getBoxOccupancy } from '@/lib/api/get-box-occupancy'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { TubeDetailActions } from './tube-detail-actions'
import { TubeDetailHeader } from './tube-detail-header'

interface TubeDetailProps {
  tube: Tube
  allTubes: Tube[]
  groupId: string
  userRole: Role
  currentUserId: string
  attributes: Attribute[]
  notes: string
  isPending?: boolean
  onAttrChange: (key: string, value: Attribute['value']) => void
  onAttrAdd: (attr: Attribute) => void
  onAttrDelete: (key: string) => void
  onNotesChange: (v: string) => void
  onDaysBeforeNotificationChange: (v: number) => void
  onCheckout?: () => void
  onCheckin?: (position: ReturnPosition) => void
  onDelete?: (reason: string) => void
}

export function TubeDetail({
  tube,
  allTubes,
  groupId,
  userRole,
  currentUserId,
  attributes,
  notes,
  isPending = false,
  onAttrChange,
  onAttrAdd,
  onAttrDelete,
  onNotesChange,
  onDaysBeforeNotificationChange,
  onCheckout,
  onCheckin,
  onDelete
}: TubeDetailProps) {
  const pos = positionLabel(tube.row, tube.column)
  const expStatus = expirationStatus(tube.expirationDate)
  const expCfg = EXPIRATION_CONFIG[expStatus]
  const days = daysUntilExpiration(tube.expirationDate)
  const isUrgent = expStatus !== 'ok' && expStatus !== 'unknown'
  const isCheckedOutByMe = tube.status === 'checked_out' && tube.checkedOut?.by.id === currentUserId
  const isCheckedOutByOther =
    tube.status === 'checked_out' && tube.checkedOut?.by.id !== currentUserId
  const canAct = !isCheckedOutByOther

  const daysLabel = (() => {
    if (days === null) return null
    if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago`
    if (days === 0) return 'today'
    return `${days} ${days === 1 ? 'day' : 'days'} remaining`
  })()

  const { data: otherCells = [] } = useQuery({
    queryKey: ['box-occupancy', tube.boxId, tube.sampleId],
    queryFn: () => getBoxOccupancy(tube.boxId!, tube.sampleId),
    enabled: !!tube.boxId
  })

  const [notesDraft, setNotesDraft] = useState(notes)
  useEffect(() => {
    setNotesDraft(notes)
  }, [notes])

  const [daysBeforeNotificationDraft, setDaysBeforeNotificationDraft] = useState(
    String(tube.daysBeforeNotification)
  )
  useEffect(() => {
    setDaysBeforeNotificationDraft(String(tube.daysBeforeNotification))
  }, [tube.daysBeforeNotification])

  return (
    <Card className='min-w-0 overflow-visible'>
      <CardContent className='p-0'>
        <div className='px-5 py-4'>
          <TubeDetailHeader
            pos={pos}
            status={tube.status}
            boxLabel={tube.box?.label}
            expStatus={expStatus}
            isUrgent={isUrgent}
            isCheckedOutByMe={isCheckedOutByMe}
            isCheckedOutByOther={isCheckedOutByOther}
            checkedOut={tube.checkedOut}
          />
          <TubeDetailActions
            tube={tube}
            allTubes={allTubes}
            groupId={groupId}
            isCheckedOutByMe={isCheckedOutByMe}
            canAct={canAct}
            isPending={isPending}
            onCheckout={onCheckout}
            onCheckin={onCheckin}
            onDelete={onDelete}
          />
        </div>

        <Separator />

        <Tabs defaultValue='details' className='flex-col'>
          <div className='px-5 pt-3'>
            <TabsList>
              <TabsTrigger value='details'>Details</TabsTrigger>
              <TabsTrigger value='attributes' className='gap-1.5'>
                Attributes
                {attributes.length > 0 && (
                  <Badge variant='secondary' className='h-4 min-w-4 px-1 text-xs tabular-nums'>
                    {attributes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='tray'>Tray</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='details' className='mt-0'>
            <div className='divide-y'>
              <div className='px-5 py-4'>
                <p className='text-sm font-medium'>Expiration</p>
                <div className='mt-2'>
                  {tube.expirationDate ? (
                    <div className='flex items-baseline gap-2'>
                      <span className={cn('text-sm', expCfg.textColor)}>
                        {new Date(tube.expirationDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {daysLabel && (
                        <span className={cn('text-xs', expCfg.textColor)}>{daysLabel}</span>
                      )}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>No expiration date set.</p>
                  )}
                </div>

                <div className='mt-4 max-w-40 space-y-1.5'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Notify before expiration (days)
                  </p>
                  <Input
                    type='number'
                    min={1}
                    value={daysBeforeNotificationDraft}
                    onChange={e => setDaysBeforeNotificationDraft(e.target.value)}
                    onBlur={() => {
                      const value = Number(daysBeforeNotificationDraft)
                      if (value > 0 && value !== tube.daysBeforeNotification) {
                        onDaysBeforeNotificationChange(value)
                      } else {
                        setDaysBeforeNotificationDraft(String(tube.daysBeforeNotification))
                      }
                    }}
                    className='bg-transparent text-sm'
                  />
                </div>
              </div>

              <div className='px-5 py-4'>
                <p className='text-sm font-medium'>Location</p>
                <div className='mt-2'>
                  {tube.box && pos ? (
                    <div className='space-y-1'>
                      <p className='text-sm'>{tube.box.freezer.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        Room {tube.box.freezer.room.number}, Building {tube.box.freezer.room.building} — Floor {tube.box.freezer.room.floor}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {tube.box.label}
                        <span className='mx-1.5'>·</span>
                        <span className='font-mono font-medium text-foreground'>{pos}</span>
                      </p>
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      This tube has not been placed in a storage box.
                    </p>
                  )}
                </div>
              </div>

              <div className='px-5 py-4'>
                <p className='text-sm font-medium'>Observations</p>
                <Textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  onBlur={() => {
                    if (notesDraft !== notes) onNotesChange(notesDraft)
                  }}
                  placeholder='Notes, handling events, or observations for this tube…'
                  className='mt-2 min-h-20 resize-none bg-transparent text-sm focus-visible:border-muted-foreground'
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='attributes' className='mt-0'>
            <AttributeList
              title='Custom Attributes'
              attributes={attributes}
              userRole={userRole}
              onChange={onAttrChange}
              onAdd={onAttrAdd}
              onDelete={onAttrDelete}
              createRole='RESEARCHER'
              deleteRole='RESEARCHER'
              layout='stack'
              flat
            />
          </TabsContent>

          <TabsContent value='tray' className='mt-0'>
            <div className='overflow-x-auto px-5 py-4'>
              {tube.box ? (
                <TubeTray
                  tubes={allTubes}
                  selectedTubeId={tube.id}
                  otherCells={otherCells}
                  boxLabel={tube.box.label}
                />
              ) : (
                <p className='text-sm text-muted-foreground'>
                  This tube has not been placed in a storage box.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
