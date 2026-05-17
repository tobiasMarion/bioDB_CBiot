import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { type Tube, buildTrayMatrix, positionLabel, rowToLetter } from './tube-data'

interface TubeTrayProps {
  tubes: Tube[]
  selectedTubeId: string | null
  otherCells?: Array<{ row: number; col: number }>
  boxLabel?: string
  rows?: number
  cols?: number
}

type LegendKey = 'Selected' | 'In storage' | 'Checked out' | 'Other sample'

const LEGEND: Array<{ label: LegendKey; dot: string }> = [
  { label: 'Selected', dot: 'bg-primary scale-125 shadow-md' },
  { label: 'In storage', dot: 'bg-primary/75' },
  { label: 'Checked out', dot: 'bg-primary/25' },
  { label: 'Other sample', dot: 'bg-foreground/20' }
]

function cellCategory(
  cell: ReturnType<typeof buildTrayMatrix>[number] | undefined,
  tube: Tube | undefined,
  isSelected: boolean
): LegendKey | null {
  if (isSelected) return 'Selected'
  if (cell?.isCheckedOut && tube) return 'Checked out'
  if (cell?.isCurrentSample && tube) return 'In storage'
  if (cell?.isOtherSample) return 'Other sample'
  return null
}

export function TubeTray({
  tubes,
  selectedTubeId,
  otherCells = [],
  boxLabel,
  rows = 8,
  cols = 12
}: TubeTrayProps) {
  const [hoveredLegend, setHoveredLegend] = useState<LegendKey | null>(null)

  const cells = buildTrayMatrix(tubes, rows, cols, otherCells)
  const cellMap = new Map(cells.map(c => [`${c.row}-${c.col}`, c]))
  const tubeMap = new Map(tubes.map(t => [t.id, t]))
  const colLabels = Array.from({ length: cols }, (_, i) => i + 1)
  const rowLabels = Array.from({ length: rows }, (_, i) => rowToLetter(i + 1))

  return (
    <TooltipProvider delayDuration={80}>
      <div className='flex flex-col gap-4'>
        {boxLabel && (
          <p className='font-mono text-xs font-medium text-muted-foreground'>{boxLabel}</p>
        )}

        <div className='w-fit rounded-xl border bg-muted/40 p-4 dark:bg-muted/25'>
          <div className='inline-flex flex-col gap-1'>
            <div className='flex gap-1'>
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
                <div key={rowLabel} className='flex items-center gap-1'>
                  <div className='flex w-5 shrink-0 items-center justify-center text-[10px] font-medium text-muted-foreground/60'>
                    {rowLabel}
                  </div>

                  {colLabels.map(col => {
                    const cell = cellMap.get(`${r}-${col}`)
                    const tube = cell?.tubeId ? tubeMap.get(cell.tubeId) : undefined
                    const isSelected = !!tube && tube.id === selectedTubeId
                    const category = cellCategory(cell, tube, isSelected)

                    const isDimmed = hoveredLegend !== null && category !== hoveredLegend
                    const isHighlighted = hoveredLegend !== null && category === hoveredLegend

                    let dotClass: string
                    let tooltip: string | null = null

                    if (isSelected) {
                      dotClass = 'bg-primary scale-125 shadow-md z-10'
                    } else if (cell?.isCheckedOut && tube) {
                      dotClass = 'bg-primary/25'
                      tooltip = `${positionLabel(tube.row, tube.column)} — checked out`
                    } else if (cell?.isCurrentSample && tube) {
                      dotClass = 'bg-primary/75'
                      tooltip = positionLabel(tube.row, tube.column)
                    } else if (cell?.isOtherSample) {
                      dotClass = 'bg-foreground/20'
                      tooltip = 'Other sample'
                    } else {
                      dotClass = 'bg-foreground/[0.07]'
                    }

                    const resolvedDotClass = isDimmed
                      ? 'bg-foreground/5'
                      : cn(dotClass, isHighlighted && !isSelected && 'scale-125')

                    const cellEl = (
                      <div className='flex aspect-square w-7 shrink-0 items-center justify-center'>
                        <div
                          className={cn(
                            'size-5 rounded-full transition-all duration-150',
                            resolvedDotClass
                          )}
                        />
                      </div>
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
