import { DNAHelix } from './dna'
import { Card, CardContent } from './ui/card'
import { Skeleton } from './ui/skeleton'

export function HeroSamplesCard({
  groupName,
  isLoading
}: { groupName: string | undefined; isLoading: boolean }) {
  return (
    <Card className='relative overflow-hidden border bg-linear-to-br from-slate-50 via-white to-cyan-50/40 dark:bg-none dark:bg-background'>
      <div className='absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.06),transparent_50%)]' />

      <div className='absolute inset-y-0 right-0 z-10 hidden w-[80%] pointer-events-none lg:block lg:w-[65%]'>
        <div className='h-full w-full'>
          <DNAHelix />
        </div>
      </div>

      <CardContent className='relative z-20 px-8 py-10 lg:px-10 lg:py-12'>
        <div className='max-w-2xl space-y-4'>
          <div className='space-y-2'>
            <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
              UFRGS • Biotechnology Center
            </p>

            <h1 className='text-3xl font-semibold tracking-tight lg:text-4xl'>
              {isLoading ? <Skeleton className='h-9 w-48' /> : (groupName ?? 'Unknown Group')}
            </h1>
          </div>

          <p className='max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base'>
            Centralized system for managing biological samples, tube locations, experiment history
            and research group access.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
