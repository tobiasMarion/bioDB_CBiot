import { Skeleton } from '@/components/ui/skeleton'

export function RoomsTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <div className='border-b'>
        <div className='grid grid-cols-6 gap-4 p-4'>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className='h-4' />
          ))}
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='grid grid-cols-6 gap-4 p-4 border-t'>
          {[...Array(6)].map((_, j) => (
            <Skeleton key={j} className='h-4' />
          ))}
        </div>
      ))}
    </div>
  )
}
