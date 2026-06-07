import { Skeleton } from '@/components/ui/skeleton'
import { ITEMS_PER_PAGE } from './samples-table'

export function SamplesTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <div className='border-b'>
        <div className='grid grid-cols-8 gap-4 p-4'>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className='h-4' />
          ))}
        </div>
      </div>
      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
        <div key={i} className='grid grid-cols-8 gap-4 p-4 border-t'>
          {[...Array(8)].map((_, j) => (
            <Skeleton key={j} className='h-4' />
          ))}
        </div>
      ))}
    </div>
  )
}
