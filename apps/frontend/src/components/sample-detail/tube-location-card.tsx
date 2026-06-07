import {
  EXPIRATION_CONFIG,
  type Tube,
  expirationStatus,
  positionLabel
} from '@/components/tube/tube-data'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Package, Thermometer } from 'lucide-react'

interface TubeLocationCardProps {
  tube: Tube
}

export function TubeLocationCard({ tube }: TubeLocationCardProps) {
  const pos = positionLabel(tube.row, tube.column)
  const expStatus = expirationStatus(tube.expirationDate)
  const expCfg = EXPIRATION_CONFIG[expStatus]
  const showExpiration = tube.expirationDate !== null && expStatus !== 'unknown'

  if (!tube.box || pos === null) return null

  return (
    <Card className='border bg-card'>
      <CardContent className='px-5 py-4'>
        <div className='space-y-4'>
          <div className='flex items-start gap-2.5'>
            <Thermometer className='mt-0.5 size-3.5 shrink-0 text-muted-foreground/40' />
            <div className='min-w-0'>
              <p className='text-sm font-medium leading-snug'>{tube.box.freezer.name}</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Room {tube.box.freezer.room.number}, Building {tube.box.freezer.room.building} —
                Floor {tube.box.freezer.room.floor}
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2.5'>
              <Package className='size-3.5 shrink-0 text-muted-foreground/40' />
              <p className='text-sm font-medium'>{tube.box.label}</p>
            </div>

            <div className='flex items-end gap-4 text-right'>
              {showExpiration && tube.expirationDate && (
                <div>
                  <p className='text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                    Expires
                  </p>
                  <p className={cn('text-xs font-medium', expCfg.textColor)}>
                    {new Date(tube.expirationDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className='text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                  Position
                </p>
                <p className='font-mono text-2xl font-bold tracking-tight text-foreground'>{pos}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
