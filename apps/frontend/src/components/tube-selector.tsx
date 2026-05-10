import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { EXPIRATION_CONFIG, type Tube, expirationStatus, positionLabel } from './tube-data'

interface TubeSelectorProps {
  tubes: Tube[]
  selectedId: string | null
  onSelect: (tube: Tube) => void
}

export function TubeSelector({ tubes, selectedId, onSelect }: TubeSelectorProps) {
  return (
    <div className='flex flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>Tubes</p>
        <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground'>
          {tubes.length}
        </span>
      </div>

      <ul
        className='flex flex-col divide-y divide-border overflow-y-auto'
        style={{ maxHeight: 'calc(10 * 60px)' }}
      >
        {tubes.length === 0 && (
          <li className='py-10 text-center text-sm text-muted-foreground'>No tubes registered.</li>
        )}

        {tubes.map(tube => {
          const isSelected = tube.id === selectedId
          const pos = positionLabel(tube.row, tube.column)
          const status = expirationStatus(tube.expirationDate)
          const expCfg = EXPIRATION_CONFIG[status]
          const isUrgent = status === 'expired' || status === 'critical' || status === 'warning'

          return (
            <li key={tube.id}>
              <button
                type='button'
                onClick={() => onSelect(tube)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-100',
                  isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'
                )}
              >
                <div
                  className={cn(
                    'w-0.5 self-stretch rounded-full transition-all',
                    isSelected
                      ? 'bg-linear-to-b from-gradient-start to-gradient-end'
                      : 'bg-transparent'
                  )}
                />

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <code
                      className={cn(
                        'font-mono text-sm font-semibold tabular-nums transition-colors',
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {pos ?? '—'}
                    </code>
                    {isUrgent && (
                      <AlertCircle className={cn('size-3 shrink-0', expCfg.textColor)} />
                    )}
                  </div>
                  {tube.box && (
                    <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                      {tube.box.label}
                    </p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
