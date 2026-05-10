import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SampleCardSkeleton() {
  return (
    <Card className='border bg-card'>
      <CardContent className='px-8 py-8 lg:px-10'>
        <div className='space-y-4'>
          <Skeleton className='h-3 w-36' />
          <Skeleton className='h-9 w-72' />
          <Skeleton className='h-4 w-56' />
          <Skeleton className='h-4 w-80' />
        </div>
      </CardContent>
    </Card>
  )
}
