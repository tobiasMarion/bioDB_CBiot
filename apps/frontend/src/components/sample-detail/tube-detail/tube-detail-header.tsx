import {
  EXPIRATION_CONFIG,
  type CheckoutInfo,
  type ExpirationStatus,
  type TubeStatus
} from '@/components/tube/tube-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface TubeDetailHeaderProps {
  pos: string | null
  status: TubeStatus
  boxLabel?: string
  expStatus: ExpirationStatus
  isUrgent: boolean
  isCheckedOutByMe: boolean
  isCheckedOutByOther: boolean
  checkedOut: CheckoutInfo | null
}

export function TubeDetailHeader({
  pos,
  status,
  boxLabel,
  expStatus,
  isUrgent,
  isCheckedOutByMe,
  isCheckedOutByOther,
  checkedOut
}: TubeDetailHeaderProps) {
  const expCfg = EXPIRATION_CONFIG[expStatus]

  return (
    <>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='font-mono text-xl font-semibold tracking-tight'>{pos ?? 'Unplaced'}</p>
            {status === 'checked_out' && <Badge variant='secondary'>Checked out</Badge>}
            {status === 'unplaced' && <Badge variant='outline'>Unplaced</Badge>}
          </div>
          {boxLabel && <p className='mt-0.5 text-sm text-muted-foreground'>{boxLabel}</p>}
        </div>
        {isUrgent && (
          <Badge
            variant={expStatus === 'expired' ? 'destructive' : 'outline'}
            className={cn('mt-0.5 shrink-0', expStatus !== 'expired' && expCfg.textColor)}
          >
            {expCfg.label}
          </Badge>
        )}
      </div>

      {status === 'checked_out' && checkedOut && (
        <p className='mt-1.5 text-sm text-muted-foreground'>
          {'by '}
          <span className='font-medium text-foreground'>
            {isCheckedOutByMe ? 'you' : checkedOut.by.name.split(' ').slice(0, 2).join(' ')}
          </span>
          {' · '}
          {timeAgo(checkedOut.at)}
          {isCheckedOutByOther && (
            <span className='ml-1 text-amber-600 dark:text-amber-400'>· not in freezer</span>
          )}
        </p>
      )}
    </>
  )
}
