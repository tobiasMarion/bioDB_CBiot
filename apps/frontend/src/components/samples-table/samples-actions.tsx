import { Button } from '@/components/ui/button'
import { Eye, Share2 } from 'lucide-react'
import { ButtonGroup } from '../ui/button-group'

interface SamplesActionsProps {
  disableShare: boolean
  onView: () => void
  onShare: () => void
}

export function SamplesActions({ onView, onShare, disableShare }: SamplesActionsProps) {
  return (
    <div className='flex items-center justify-center gap-1'>
      <ButtonGroup>
        <Button variant='outline' size='sm' onClick={onView} className='h-8 px-2 text-xs'>
          <Eye className='size-3.5 mr-1' />
          View
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
