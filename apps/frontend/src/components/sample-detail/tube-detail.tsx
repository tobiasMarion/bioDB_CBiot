import { AttributeList } from '@/components/attributes/attribute-list'
import type { Attribute, Role } from '@/components/attributes/types'
import {
  EXPIRATION_CONFIG,
  type Tube,
  daysUntilExpiration,
  expirationStatus,
  positionLabel
} from '@/components/tube-data'
import { TubeTray } from '@/components/tube-tray'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FlaskConical, MapPin, Package, Scissors, Thermometer } from 'lucide-react'
import { DeleteTubeDialog } from './delete-tube-dialog'

interface TubeDetailProps {
  tube: Tube
  allTubes: Tube[]
  selectedTubeId: string
  userRole: Role
  attributes: Attribute[]
  notes: string
  onAttrChange: (key: string, value: Attribute['value']) => void
  onAttrAdd: (attr: Attribute) => void
  onAttrDelete: (key: string) => void
  onTubeSelect: (tubeId: string) => void
  onNotesChange: (v: string) => void
  otherCells?: Array<{ row: number; col: number }>
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>{title}</p>
  )
}

export function TubeDetail({
  tube,
  allTubes,
  selectedTubeId,
  userRole,
  attributes,
  notes,
  onAttrChange,
  onAttrAdd,
  onAttrDelete,
  onTubeSelect,
  onNotesChange,
  otherCells = []
}: TubeDetailProps) {
  const pos = positionLabel(tube.row, tube.column)
  const expStatus = expirationStatus(tube.expirationDate)
  const expCfg = EXPIRATION_CONFIG[expStatus]
  const days = daysUntilExpiration(tube.expirationDate)
  const isUrgent = expStatus !== 'ok' && expStatus !== 'unknown'

  const daysLabel = (() => {
    if (days === null) return null
    if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago`
    if (days === 0) return 'today'
    return `${days} ${days === 1 ? 'day' : 'days'} remaining`
  })()

  const tray = (
    <TubeTray
      tubes={allTubes}
      rows={8}
      cols={12}
      selectedTubeId={selectedTubeId}
      onSelect={onTubeSelect}
      boxLabel={tube.box?.label}
      otherCells={otherCells}
    />
  )

  return (
    <Card className='min-w-0 border overflow-visible'>
      <CardContent className='p-0'>
        <div className='flex flex-col lg:flex-row'>
          <div className='min-w-0 flex-1'>
            <div className='px-5 py-4'>
              <p className='font-mono text-xl font-semibold tracking-tight'>{pos ?? 'Unplaced'}</p>
              <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                {tube.box && (
                  <span className='text-sm text-muted-foreground'>{tube.box.label}</span>
                )}
                {isUrgent && (
                  <span className={cn('text-xs font-medium', expCfg.textColor)}>
                    · {expCfg.label}
                  </span>
                )}
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                {/* TODO: implement fractionate — creates an aliquot copy of this tube */}
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => console.log('fractionate', tube.id)}
                >
                  <Scissors className='size-3.5' />
                  Fractionate
                </Button>
                {/* TODO: implement removal — records experiment usage */}
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => console.log('remove for experiment', tube.id)}
                >
                  <FlaskConical className='size-3.5' />
                  Remove for Experiment
                </Button>
                {/* TODO: implement deletion — archives tube with mandatory reason */}
                <DeleteTubeDialog
                  onDelete={reason => console.log('delete tube', tube.id, reason)}
                />
              </div>
            </div>

            <Separator />

            <div className='px-5 py-4 lg:hidden'>{tray}</div>

            <Separator className='lg:hidden' />

            <div className='px-5 py-4'>
              <SectionHeader title='Expiration' />
              <div className='mt-2'>
                {tube.expirationDate ? (
                  <div className='flex items-baseline gap-2'>
                    <span className={cn('text-sm font-semibold', expCfg.textColor)}>
                      {new Date(tube.expirationDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    {daysLabel && (
                      <>
                        <span className='text-muted-foreground/30'>·</span>
                        <span className={cn('text-xs', expCfg.textColor)}>{daysLabel}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>No expiration date set.</p>
                )}
              </div>
            </div>

            <Separator />

            <div className='px-5 py-4'>
              <SectionHeader title='Location' />
              <div className='mt-3'>
                {tube.box && pos ? (
                  <div className='space-y-2.5'>
                    <div className='flex items-start gap-2.5'>
                      <Thermometer className='mt-0.5 size-3.5 shrink-0 text-muted-foreground/40' />
                      <div className='min-w-0'>
                        <p className='text-sm text-foreground'>{tube.box.freezer.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {tube.box.freezer.locationDescription}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <Package className='size-3.5 shrink-0 text-muted-foreground/40' />
                      <p className='text-sm text-muted-foreground'>
                        {tube.box.label}
                        <span className='mx-1.5 text-muted-foreground/30'>·</span>
                        <span className='font-mono font-bold text-foreground'>{pos}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <MapPin className='size-3.5 shrink-0' />
                    <span>This tube has not been placed in a storage box.</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

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

            <Separator />

            <div className='px-5 py-4'>
              <SectionHeader title='Observations' />
              <Textarea
                value={notes}
                onChange={e => onNotesChange(e.target.value)}
                placeholder='Notes, handling events, or observations for this tube…'
                className='mt-3 min-h-20 resize-none border-border bg-transparent text-sm focus-visible:border-muted-foreground'
              />
            </div>
          </div>

          <div className='hidden shrink-0 border-l border-border lg:block'>
            <div className='sticky top-6 p-5'>{tray}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
