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

function sectionHeader(title: string) {
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

  return (
    <div className='flex flex-col gap-5'>
      {/* Primary actions — always first, most important */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='font-mono text-xl font-semibold tracking-tight'>{pos ?? 'Unplaced'}</p>
          {tube.box && <span className='text-sm text-muted-foreground'>· {tube.box.label}</span>}
          {isUrgent && (
            <span className={cn('text-xs font-medium', expCfg.textColor)}>· {expCfg.label}</span>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
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
          <DeleteTubeDialog onDelete={reason => console.log('delete tube', tube.id, reason)} />
        </div>
      </div>

      <Separator className='opacity-30' />

      {/* Unified tube record ("ficha do tubo") beside tray */}
      <div className='flex flex-col gap-5 lg:flex-row lg:items-start'>
        <Card className='min-w-0 flex-1 border bg-card'>
          <CardContent className='p-0'>
            {/* Expiration */}
            <div className='px-5 py-4'>
              {sectionHeader('Expiration')}
              <div className='mt-2'>
                {tube.expirationDate ? (
                  <div className='flex items-baseline gap-2'>
                    <span className={cn('text-sm font-medium', expCfg.textColor)}>
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
                  <p className='text-sm text-muted-foreground/50'>No expiration date set.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className='px-5 py-4'>
              {sectionHeader('Location')}
              <div className='mt-3'>
                {tube.box && pos ? (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Thermometer className='size-3.5 shrink-0 text-muted-foreground/40' />
                      <p className='text-sm'>
                        <span className='font-medium'>{tube.box.freezer.name}</span>
                        <span className='mx-1.5 text-muted-foreground/30'>·</span>
                        <span className='text-xs text-muted-foreground'>
                          {tube.box.freezer.locationDescription}
                        </span>
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
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

            {/* Custom attributes — flat AttributeList renders its own section header */}
            <AttributeList
              title='Custom Attributes'
              attributes={attributes}
              userRole={userRole}
              onChange={onAttrChange}
              onAdd={onAttrAdd}
              onDelete={onAttrDelete}
              createRole='MANAGER'
              deleteRole='MANAGER'
              layout='grid'
              flat
            />

            <Separator />

            {/* Observations */}
            <div className='px-5 py-4'>
              {sectionHeader('Observations')}
              <Textarea
                value={notes}
                onChange={e => onNotesChange(e.target.value)}
                placeholder='Notes, handling events, or observations for this tube…'
                className='mt-3 min-h-20 resize-none border-muted-foreground/20 bg-transparent text-sm focus-visible:border-muted-foreground/40'
              />
            </div>
          </CardContent>
        </Card>

        {/* Tray — natural size, no card wrapper */}
        <div className='shrink-0'>
          <TubeTray
            tubes={allTubes}
            rows={8}
            cols={12}
            selectedTubeId={selectedTubeId}
            onSelect={onTubeSelect}
            boxLabel={tube.box?.label}
            otherCells={otherCells}
          />
        </div>
      </div>
    </div>
  )
}
