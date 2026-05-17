import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type Tube, daysUntilExpiration, expirationStatus, positionLabel } from './tube-data'

interface TubeSelectorProps {
  tubes: Tube[]
  selectedId: string | null
  onSelect: (tube: Tube) => void
}

export function TubeSelector({ tubes, selectedId, onSelect }: TubeSelectorProps) {
  return (
    <div className='flex flex-col overflow-hidden rounded-md border'>
      <ul
        className='flex flex-col divide-y overflow-y-auto'
        style={{ maxHeight: 'calc(10 * 56px)' }}
      >
        {tubes.length === 0 && (
          <li className='py-10 text-center text-sm text-muted-foreground'>No tubes registered.</li>
        )}

        {tubes.map(tube => {
          const isSelected = tube.id === selectedId
          const pos = positionLabel(tube.row, tube.column)
          const expStatus = expirationStatus(tube.expirationDate)
          const days = daysUntilExpiration(tube.expirationDate)
          const isCheckedOut = tube.status === 'checked_out'
          const isUnplaced = tube.status === 'unplaced'

          let badgeVariant: 'secondary' | 'destructive' | 'outline' = 'secondary'
          let badgeLabel: string | null = null

          if (isCheckedOut) {
            badgeVariant = 'outline'
            badgeLabel = 'Out'
          } else if (expStatus === 'expired') {
            badgeVariant = 'destructive'
            badgeLabel = 'Expired'
          } else if ((expStatus === 'critical' || expStatus === 'warning') && days !== null) {
            badgeVariant = 'outline'
            badgeLabel = `${days}d`
          } else if (isUnplaced) {
            badgeVariant = 'secondary'
            badgeLabel = 'Unplaced'
          }

          return (
            <li key={tube.id}>
              <button
                type='button'
                onClick={() => onSelect(tube)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition-colors',
                  isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )}
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <code className='font-mono font-medium tabular-nums'>{pos ?? '—'}</code>
                    {badgeLabel && (
                      <Badge variant={badgeVariant} className='h-5 py-0 text-xs'>
                        {badgeLabel}
                      </Badge>
                    )}
                  </div>
                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {tube.box?.label ?? (isUnplaced ? 'Not in storage' : 'No box assigned')}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
