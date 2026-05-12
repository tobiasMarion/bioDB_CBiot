import { AttributeList } from '@/components/attributes/attribute-list'
import type { Attribute, Role } from '@/components/attributes/types'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ReturnPosition } from '../return-to-freezer/return-to-freezer-dialog'
import { TubeDetailActions } from './tube-detail-actions'
import { TubeDetailHeader } from './tube-detail-header'

interface TubeDetailProps {
  tube: Tube
  allTubes: Tube[]
  userRole: Role
  currentUserId: string
  attributes: Attribute[]
  notes: string
  onAttrChange: (key: string, value: Attribute['value']) => void
  onAttrAdd: (attr: Attribute) => void
  onAttrDelete: (key: string) => void
  onNotesChange: (v: string) => void
  onCheckout?: () => void
  onCheckin?: (position: ReturnPosition) => void
  otherCells?: Array<{ row: number; col: number }>
}

export function TubeDetail({
  tube,
  allTubes,
  userRole,
  currentUserId,
  attributes,
  notes,
  onAttrChange,
  onAttrAdd,
  onAttrDelete,
  onNotesChange,
  onCheckout,
  onCheckin,
  otherCells = []
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
            isCheckedOutByMe={isCheckedOutByMe}
            canAct={canAct}
            otherCells={otherCells}
            onCheckout={onCheckout}
            onCheckin={onCheckin}
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
              </div>

              <div className='px-5 py-4'>
                <p className='text-sm font-medium'>Location</p>
                <div className='mt-2'>
                  {tube.box && pos ? (
                    <div className='space-y-1'>
                      <p className='text-sm'>{tube.box.freezer.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {tube.box.freezer.locationDescription}
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
                  value={notes}
                  onChange={e => onNotesChange(e.target.value)}
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
              createRole='MANAGER'
              deleteRole='MANAGER'
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
