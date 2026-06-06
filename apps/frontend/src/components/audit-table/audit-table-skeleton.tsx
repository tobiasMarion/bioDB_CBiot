import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'

export function AuditTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className='h-4 w-32' /></TableCell>
          <TableCell>
            <div className='flex flex-col gap-1'>
              <Skeleton className='h-5 w-20' />
              <Skeleton className='h-3 w-16' />
            </div>
          </TableCell>
          <TableCell><Skeleton className='h-5 w-16' /></TableCell>
          <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          <TableCell className='text-right'><Skeleton className='h-7 w-7 ml-auto' /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
