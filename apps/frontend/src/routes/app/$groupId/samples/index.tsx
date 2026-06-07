import { HeroSamplesCard } from '@/components/hero-sample-card'
import { SamplesTable } from '@/components/samples-table'
import { StatCard } from '@/components/stats-cards'
import { useGroupRole } from '@/hooks/use-group-role'
import { usePageTitle } from '@/hooks/use-page-title'
import { getGroupDetails } from '@/lib/api/get-group-details'
import { getSamplesStats } from '@/lib/api/get-samples-stats'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples/')({
  validateSearch: (search: Record<string, unknown>): { create?: true } =>
    search.create === true || search.create === 'true' ? { create: true } : {},
  component: RouteComponent
})

function RouteComponent() {
  const params = useParams({ from: '/app/$groupId/samples/' })
  const groupId = params.groupId
  const userRole = useGroupRole(groupId)
  const { create } = Route.useSearch()
  const navigate = useNavigate()

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupDetails(groupId)
  })

  usePageTitle(group ? `Samples — ${group.name}` : 'Samples')

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

        <SamplesTable
          groupId={groupId}
          userRole={userRole}
          openCreate={create ?? false}
          onOpenChangeCreate={open => navigate({ to: '.', search: open ? { create: true } : {} })}
        />
      </div>
    </div>
  )
}
