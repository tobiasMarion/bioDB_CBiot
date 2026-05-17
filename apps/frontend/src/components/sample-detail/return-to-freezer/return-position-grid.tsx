import { buildTrayMatrix, positionLabel, rowToLetter } from '@/components/tube/tube-data'
import type { Tube } from '@/components/tube/tube-data'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ReturnPositionGridProps {
  tubesInBox: Tube[]
  otherCells?: Array<{ row: number; col: number }>
  selectedCell: { row: number; col: number } | null
  onCellSelect: (cell: { row: number; col: number }) => void
  suggestedCell?: { row: number; col: number } | null
  boxLabel?: string
  rows?: number
  cols?: number
}

type LegendKey =
  | 'Your selection'
  | 'Original position'
  | 'This sample'
  | 'Other sample'
  | 'Available'

const LEGEND: Array<{ label: LegendKey; dot: string }> = [
  { label: 'Your selection', dot: 'bg-primary scale-125 shadow-md' },
  { label: 'Original position', dot: 'border-2 border-dashed border-primary/60 bg-primary/10' },
  { label: 'This sample', dot: 'bg-primary/35' },
  { label: 'Other sample', dot: 'bg-foreground/18' },
  { label: 'Available', dot: 'border border-border/70' }
]

export function ReturnPositionGrid({
  tubesInBox,
  otherCells = [],
  selectedCell,
  onCellSelect,
  suggestedCell,
  boxLabel,
  rows = 8,
  cols = 12
}: ReturnPositionGridProps) {
  const [hoveredLegend, setHoveredLegend] = useState<LegendKey | null>(null)

  const cells = buildTrayMatrix(tubesInBox, rows, cols, otherCells)
  const cellMap = new Map(cells.map(c => [`${c.row}-${c.col}`, c]))
  const tubeMap = new Map(tubesInBox.map(t => [t.id, t]))
  const colLabels = Array.from({ length: cols }, (_, i) => i + 1)
  const rowLabels = Array.from({ length: rows }, (_, i) => rowToLetter(i + 1))

  return (
    <TooltipProvider delayDuration={80}>
      <div className='flex flex-col gap-4'>
        {boxLabel && (
          <p className='font-mono text-xs font-medium text-muted-foreground'>{boxLabel}</p>
        )}

        <div className='w-fit rounded-xl border bg-muted/40 p-4 dark:bg-muted/25'>
          <div className='inline-flex flex-col gap-[5px]'>
            <div className='flex gap-[5px]'>
              <div className='w-5 shrink-0' />
              {colLabels.map(col => (
                <div
                  key={col}
                  className='flex w-7 shrink-0 items-center justify-center text-[10px] font-medium tabular-nums text-muted-foreground/60'
                >
                  {col}
                </div>
              ))}
            </div>

            {rowLabels.map((rowLabel, rowIdx) => {
              const r = rowIdx + 1
              return (
                <div key={rowLabel} className='flex items-center gap-[5px]'>
                  <div className='flex w-5 shrink-0 items-center justify-center text-[10px] font-medium text-muted-foreground/60'>
                    {rowLabel}
                  </div>

                  {colLabels.map(col => {
                    const cell = cellMap.get(`${r}-${col}`)
                    const tube = cell?.tubeId ? tubeMap.get(cell.tubeId) : undefined
                    const isOccupied = !!(cell?.isCurrentSample || cell?.isOtherSample)
                    const isSelected =
                      !!selectedCell && r === selectedCell.row && col === selectedCell.col
                    const isSuggested =
                      !!suggestedCell &&
                      r === suggestedCell.row &&
                      col === suggestedCell.col &&
                      !isOccupied
                    const isClickable = !isOccupied

                    const category: LegendKey | null = isSelected
                      ? 'Your selection'
                      : isSuggested
                        ? 'Original position'
                        : cell?.isCurrentSample && tube
                          ? 'This sample'
                          : cell?.isOtherSample
                            ? 'Other sample'
                            : !isOccupied
                              ? 'Available'
                              : null

                    const isDimmed = hoveredLegend !== null && category !== hoveredLegend
                    const isHighlighted = hoveredLegend !== null && category === hoveredLegend

                    let dotClass: string
                    let tooltip: string | null = null

                    if (isSelected) {
                      dotClass = 'bg-primary scale-125 shadow-md z-10'
                    } else if (isSuggested) {
                      dotClass =
                        'border-2 border-dashed border-primary/60 bg-primary/10 group-hover:bg-primary/20'
                      tooltip = `${positionLabel(r, col)} — original position`
                    } else if (cell?.isCurrentSample && tube) {
                      dotClass = 'bg-primary/35'
                      tooltip = positionLabel(tube.row, tube.column)
                    } else if (cell?.isOtherSample) {
                      dotClass = 'bg-foreground/18'
                      tooltip = 'Other sample'
                    } else {
                      dotClass =
                        'border border-border/70 group-hover:bg-primary/20 group-hover:border-primary/50'
                    }

                    const resolvedDotClass = isDimmed
                      ? 'bg-foreground/[0.05]'
                      : cn(dotClass, isHighlighted && !isSelected && 'scale-125')

                    const wrapperEl = (
                      <div
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : -1}
                        aria-label={
                          isClickable ? `Select position ${positionLabel(r, col)}` : undefined
                        }
                        onClick={() => {
                          if (isClickable) onCellSelect({ row: r, col })
                        }}
                        onKeyDown={e => {
                          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            onCellSelect({ row: r, col })
                          }
                        }}
                        className={cn(
                          'flex aspect-square w-7 shrink-0 items-center justify-center',
                          isClickable ? 'cursor-pointer group' : 'cursor-default'
                        )}
                      >
                        <div
                          className={cn(
                            'size-[18px] rounded-full transition-all duration-150',
                            resolvedDotClass
                          )}
                        />
                      </div>
                    )

                    if (!tooltip) return <div key={col}>{wrapperEl}</div>

                    return (
                      <Tooltip key={col}>
                        <TooltipTrigger asChild>{wrapperEl}</TooltipTrigger>
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

        <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5'>
          {LEGEND.map(item => {
            const isActive = hoveredLegend === item.label
            return (
              <div
                key={item.label}
                className='flex cursor-default select-none items-center gap-2'
                onMouseEnter={() => setHoveredLegend(item.label)}
                onMouseLeave={() => setHoveredLegend(null)}
              >
                <div
                  className={cn(
                    'size-2.5 rounded-full transition-transform duration-150',
                    item.dot,
                    isActive && 'scale-125'
                  )}
                />
                <span
                  className={cn(
                    'text-xs transition-colors duration-150',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
