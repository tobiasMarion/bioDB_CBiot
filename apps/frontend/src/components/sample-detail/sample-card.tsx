import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { SampleDetail } from '@/lib/api/get-sample'
import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DeleteSampleDialog } from './delete-sample-dialog'
import { EditableName } from './editable-name'
import { EditableTypeBadge } from './editable-type-badge'
import { InlineField } from './inline-field'

interface SampleCardProps {
  sample: SampleDetail
  canEdit: boolean
  canDelete: boolean
  isOwner: boolean
  onDelete: () => void
}

export function SampleCard({ sample, canEdit, canDelete, isOwner, onDelete }: SampleCardProps) {
  const [name, setName] = useState(sample.name)
  const [type, setType] = useState(sample.type)
  const [originOrganism, setOriginOrganism] = useState(sample.originOrganism)
  const [sourceLab, setSourceLab] = useState(sample.sourceLab)
  const [observations, setObservations] = useState('')

  useEffect(() => {
    setName(sample.name)
    setType(sample.type)
    setOriginOrganism(sample.originOrganism)
    setSourceLab(sample.sourceLab)
  }, [sample])

  return (
    <Card className='relative overflow-hidden border bg-linear-to-br from-slate-50 via-white to-cyan-50/30 dark:bg-none dark:bg-background'>
      <div className='absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.05),transparent_55%)]' />
      <CardContent className='relative z-10 px-6 py-6 sm:px-8 sm:py-8 lg:px-10'>
        <div className='flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8'>
          <div className='min-w-0 flex-1 space-y-5'>
            <p className='text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
              {sample.group.name}
            </p>

            <EditableName value={name} onChange={setName} canEdit={canEdit} />

            <div className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
              <EditableTypeBadge value={type} onChange={setType} canEdit={canEdit} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className='cursor-default rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-muted-foreground'>
                      {sample.id.slice(0, 8)}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='font-mono text-xs'>{sample.id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className='hidden text-muted-foreground/30 sm:inline'>·</span>
              <span className='text-xs text-muted-foreground'>
                By <span className='font-medium text-foreground'>{sample.creator.name}</span>
                {' · '}
                {sample.group.name}
              </span>
              <span className='hidden text-muted-foreground/30 sm:inline'>·</span>
              <span className='text-xs text-muted-foreground'>
                {new Date(sample.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className='grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2'>
              <div>
                <p className='mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                  Origin Organism
                </p>
                <InlineField
                  value={originOrganism}
                  onChange={setOriginOrganism}
                  canEdit={canEdit}
                  placeholder='Not specified'
                />
              </div>
              <div>
                <p className='mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                  Source Lab
                </p>
                <InlineField
                  value={sourceLab}
                  onChange={setSourceLab}
                  canEdit={canEdit}
                  placeholder='Not specified'
                />
              </div>
            </div>
          </div>

          <div className='flex shrink-0 flex-col items-end gap-3 pt-1'>
            <div className='text-right'>
              <p className='text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
                Tubes
              </p>
              <p className='text-2xl font-semibold tabular-nums'>{sample.amountOfTubes}</p>
            </div>
            <div className='flex items-center gap-1'>
              {canDelete && <DeleteSampleDialog sampleName={name} onDelete={onDelete} />}
              {isOwner && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground'
                >
                  <Share2 className='size-3' />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className='my-5 opacity-40' />

        <p className='mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase'>
          Observations
        </p>
        <Textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder='Add observations, handling notes, or relevant context…'
          className='min-h-16 resize-none border-border bg-background/50 text-sm backdrop-blur-sm focus-visible:border-muted-foreground'
        />
      </CardContent>
    </Card>
  )
}
