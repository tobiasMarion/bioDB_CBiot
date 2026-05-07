import { HeroSamplesCard } from '@/components/hero-sample-card'
import { StatCard } from '@/components/stats-cards'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getGroupDetails } from '@/lib/api/get-group-details'
import { getSamplesStats } from '@/lib/api/get-samples-stats'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples')({
  component: RouteComponent
})

function RouteComponent() {
  const params = useParams({ from: '/app/$groupId/samples' })
  const groupId = params.groupId

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupDetails(groupId)
  })

  const { data: stats } = useQuery({
    queryKey: ['samples-stats', groupId],
    queryFn: () => getSamplesStats(groupId)
  })

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='flex flex-col gap-10 px-5 py-6 lg:px-8'>
        <HeroSamplesCard groupName={group?.name} isLoading={isLoadingGroup} />

        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            label='Total Samples'
            value={stats?.totalSamples.toLocaleString('pt-BR') ?? '0'}
            subtext={`+${stats?.samplesLastMonth ?? 0} this month`}
          />
          <StatCard
            label='Total Tubes'
            value={stats?.totalTubes.toLocaleString('pt-BR') ?? '0'}
            subtext={`in ${stats?.boxesWithTubes ?? 0} different boxes`}
          />
          <StatCard
            label='Expiring Soon'
            value={stats?.expiringSoon.toLocaleString('pt-BR') ?? '0'}
            subtext='in the next 30 days'
          />
          <StatCard
            label='Different Organisms'
            value={stats?.differentOrganisms.toLocaleString('pt-BR') ?? '0'}
            subtext='origin species'
          />
        </section>

        {/* TABLE */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-40 rounded-md' />
              <Skeleton className='h-3 w-64 rounded-md' />
            </div>

            <div className='flex gap-3'>
              <Skeleton className='h-9 w-24 rounded-lg' />
              <Skeleton className='h-9 w-32 rounded-lg' />
            </div>
          </CardHeader>

          <CardContent className='space-y-3'>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className='grid grid-cols-5 gap-6 rounded-xl border bg-background/40 px-4 py-4'
              >
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className='h-4 w-full rounded-md' />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
