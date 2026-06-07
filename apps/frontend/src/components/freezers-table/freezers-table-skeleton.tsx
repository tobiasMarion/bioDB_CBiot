import { Skeleton } from '@/components/ui/skeleton'

export function FreezersTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <div className='border-b'>
        <div className='grid grid-cols-4 gap-4 p-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-4' />
          ))}
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='grid grid-cols-4 gap-4 p-4 border-t'>
          {[...Array(4)].map((_, j) => (
            <Skeleton key={j} className='h-4' />
          ))}
        </div>
      ))}
    </div>
  )
}
