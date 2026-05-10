import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Tube, buildTrayMatrix, positionLabel, rowToLetter } from './tube-data'

interface TubeTrayProps {
  tubes: Tube[]
  rows?: number
  cols?: number
  selectedTubeId: string | null
  onSelect?: (tubeId: string) => void
  boxLabel?: string
  otherCells?: Array<{ row: number; col: number }>
}

const legend = [
  {
    label: 'Selected',
    className: 'bg-linear-to-br from-gradient-start to-gradient-end border-transparent'
  },
  {
    label: 'This sample',
    className: 'bg-teal-500/10 border-teal-500/30 dark:bg-teal-400/10 dark:border-teal-400/25'
  },
  { label: 'Other sample', className: 'bg-muted border-border' },
  { label: 'Empty', className: 'bg-transparent border-border/40' }
]

export function TubeTray({
  tubes,
  rows = 8,
  cols = 12,
  selectedTubeId,
  onSelect,
  boxLabel,
  otherCells = []
}: TubeTrayProps) {
  const cells = buildTrayMatrix(tubes, rows, cols, otherCells)
  const tubeMap = new Map(tubes.map(t => [t.id, t]))
  const colLabels = Array.from({ length: cols }, (_, i) => i + 1)
  const rowLabels = Array.from({ length: rows }, (_, i) => rowToLetter(i + 1))

  return (
    <TooltipProvider delayDuration={80}>
      <div className='flex flex-col gap-3'>
        <div>
          <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
            Tray View
          </p>
          {boxLabel && (
            <p className='mt-0.5 font-mono text-[11px] text-muted-foreground'>{boxLabel}</p>
          )}
        </div>

        <div className='overflow-x-auto'>
          <div className='inline-flex flex-col gap-[3px]'>
            <div className='flex gap-[3px]'>
              <div className='w-4 shrink-0' />
              {colLabels.map(col => (
                <div
                  key={col}
                  className='flex w-6 shrink-0 items-center justify-center text-[9px] font-medium text-muted-foreground'
                >
                  {col}
                </div>
              ))}
            </div>

            {rowLabels.map((rowLabel, rowIdx) => {
              const r = rowIdx + 1
              return (
                <div key={rowLabel} className='flex items-center gap-[3px]'>
                  <div className='flex w-4 shrink-0 items-center justify-center text-[9px] font-medium text-muted-foreground'>
                    {rowLabel}
                  </div>

                  {colLabels.map(col => {
                    const cell = cells.find(c => c.row === r && c.col === col)
                    const tube = cell?.tubeId ? tubeMap.get(cell.tubeId) : undefined
                    const isSelected = !!tube && tube.id === selectedTubeId

                    let cellClass =
                      'bg-transparent border-border/40 hover:border-muted-foreground/20 cursor-default'
                    let tooltip: string | null = null

                    if (isSelected) {
                      cellClass =
                        'bg-linear-to-br from-gradient-start to-gradient-end border-transparent scale-110 z-10 shadow-sm cursor-pointer'
                    } else if (cell?.isCurrentSample && tube) {
                      cellClass =
                        'bg-teal-500/10 border-teal-500/30 dark:bg-teal-400/10 dark:border-teal-400/25 cursor-pointer hover:bg-teal-500/20 dark:hover:bg-teal-400/15'
                      tooltip = positionLabel(tube.row, tube.column)
                    } else if (cell?.isOtherSample) {
                      cellClass = 'bg-muted border-border cursor-default'
                      tooltip = 'Other sample'
                    }

                    const cellEl = (
                      <button
                        type='button'
                        className={cn(
                          'aspect-square w-6 shrink-0 rounded-[2px] border transition-all duration-150',
                          cellClass
                        )}
                        onClick={() => {
                          if (tube && onSelect) onSelect(tube.id)
                        }}
                        aria-label={
                          tube
                            ? `Select tube at position ${positionLabel(tube.row, tube.column)}`
                            : undefined
                        }
                        tabIndex={tube ? 0 : -1}
                      />
                    )

                    if (!tooltip) return <div key={col}>{cellEl}</div>

                    return (
                      <Tooltip key={col}>
                        <TooltipTrigger asChild>{cellEl}</TooltipTrigger>
                        <TooltipContent side='top' className='text-xs'>
                          {tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 pt-1'>
          {legend.map(item => (
            <div key={item.label} className='flex items-center gap-1.5'>
              <span className={cn('size-2 rounded-sm border', item.className)} />
              <span className='text-[10px] text-muted-foreground'>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
