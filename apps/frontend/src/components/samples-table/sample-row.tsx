import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Sample } from '@/lib/api/get-samples'
import { Link } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'
import { SamplesActions } from './samples-actions'

interface SampleRowProps {
  sample: Sample
  groupId: string
  onShare: () => void
}

export function SampleRow({ sample, groupId, onShare }: SampleRowProps) {
  const isShared = sample.group.id !== groupId

  return (
    <TableRow>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <code className='text-xs text-muted-foreground truncate max-w-20 block'>
                {sample.id.slice(0, 8)}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <p className='font-mono text-xs'>{sample.id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Button variant='ghost' className='flex gap-2 items-center justify-start' asChild>
          <Link to='/app/$groupId/samples/$id' params={{ groupId, id: sample.id }}>
            {sample.name}
            {isShared && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className='flex items-center justify-center p-1 -m-1'>
                      <Share2 className='size-4 text-muted-foreground' />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    <p>Owned by: {sample.group.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Link>
        </Button>
      </TableCell>
      <TableCell className='text-right font-mono text-sm'>{sample.amountOfTubes}</TableCell>
      <TableCell>
        <Badge variant='outline' className='text-muted-foreground'>
          {sample.type}
        </Badge>
      </TableCell>
      <TableCell className='text-muted-foreground'>{sample.sourceLab || '-'}</TableCell>
      <TableCell className='text-muted-foreground'>{sample.originOrganism || '-'}</TableCell>
      <TableCell className='text-muted-foreground text-sm'>
        {new Date(sample.createdAt).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell className='text-right'>
        <SamplesActions
          groupId={groupId}
          sampleId={sample.id}
          disableShare={isShared}
          onShare={onShare}
        />
      </TableCell>
    </TableRow>
  )
}
