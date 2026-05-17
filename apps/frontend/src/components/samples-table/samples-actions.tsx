import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Eye, Share2 } from 'lucide-react'
import { ButtonGroup } from '../ui/button-group'

interface SamplesActionsProps {
  groupId: string
  sampleId: string
  disableShare: boolean
  onShare: () => void
}

export function SamplesActions({ groupId, sampleId, onShare, disableShare }: SamplesActionsProps) {
  return (
    <div className='flex items-center justify-center gap-1'>
      <ButtonGroup>
        <Button variant='outline' size='sm' className='h-8 px-2 text-xs' asChild>
          <Link to='/app/$groupId/samples/$id' params={{ groupId, id: sampleId }}>
            <Eye className='size-3.5 mr-1' />
            View
          </Link>
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={disableShare}
          onClick={onShare}
          className={'h-8 px-2 text-xs'}
        >
          <Share2 className='size-3.5 mr-1' />
          Share
        </Button>
      </ButtonGroup>
    </div>
  )
}
