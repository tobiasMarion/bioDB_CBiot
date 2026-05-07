import { HeroSamplesCard } from '@/components/hero-sample-card'
import { SamplesTable } from '@/components/samples-table'
import { StatCard } from '@/components/stats-cards'
import { getGroupDetails } from '@/lib/api/get-group-details'
import { getSamplesStats } from '@/lib/api/get-samples-stats'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples')({
  component: RouteComponent
})

// const MOCK_SAMPLES: Sample[] = [
//   {
//     id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
//     name: 'Sample 001',
//     type: 'DNA',
//     tubesCount: 24,
//     originOrganism: 'Homo sapiens',
//     sourceLab: 'Lab A',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u12345678-1234-1234-1234-123456789012',
//     createdAt: '2026-05-07T12:00:00.000Z',
//     updatedAt: '2026-05-07T12:00:00.000Z',
//     creator: {
//       id: 'u12345678-1234-1234-1234-123456789012',
//       name: 'John Doe',
//       email: 'john@example.com'
//     }
//   },
//   {
//     id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
//     name: 'Sample 002',
//     type: 'RNA',
//     tubesCount: 12,
//     originOrganism: 'Mus musculus',
//     sourceLab: 'Lab B',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u23456789-1234-1234-1234-123456789013',
//     createdAt: '2026-05-06T10:30:00.000Z',
//     updatedAt: '2026-05-06T10:30:00.000Z',
//     creator: {
//       id: 'u23456789-1234-1234-1234-123456789013',
//       name: 'Jane Smith',
//       email: 'jane@example.com'
//     }
//   },
//   {
//     id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
//     name: 'Sample 003',
//     type: 'Protein',
//     tubesCount: 8,
//     originOrganism: 'Escherichia coli',
//     sourceLab: 'Lab A',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u12345678-1234-1234-1234-123456789012',
//     createdAt: '2026-05-05T09:15:00.000Z',
//     updatedAt: '2026-05-05T09:15:00.000Z',
//     creator: {
//       id: 'u12345678-1234-1234-1234-123456789012',
//       name: 'John Doe',
//       email: 'john@example.com'
//     }
//   },
//   {
//     id: 'd4e5f6a7-b8c9-0123-defg-456789012345',
//     name: 'Sample 004',
//     type: 'DNA',
//     tubesCount: 36,
//     originOrganism: 'Homo sapiens',
//     sourceLab: 'Lab C',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u34567890-1234-1234-1234-123456789014',
//     createdAt: '2026-05-04T14:45:00.000Z',
//     updatedAt: '2026-05-04T14:45:00.000Z',
//     creator: {
//       id: 'u34567890-1234-1234-1234-123456789014',
//       name: 'Alice Johnson',
//       email: 'alice@example.com'
//     }
//   },
//   {
//     id: 'e5f6a7b8-c9d0-1234-efgh-567890123456',
//     name: 'Sample 005',
//     type: 'Cell Line',
//     tubesCount: 6,
//     originOrganism: 'Rattus norvegicus',
//     sourceLab: 'Lab B',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u23456789-1234-1234-1234-123456789013',
//     createdAt: '2026-05-03T11:20:00.000Z',
//     updatedAt: '2026-05-03T11:20:00.000Z',
//     creator: {
//       id: 'u23456789-1234-1234-1234-123456789013',
//       name: 'Jane Smith',
//       email: 'jane@example.com'
//     }
//   },
//   {
//     id: 'f6a7b8c9-d0e1-2345-fghi-678901234567',
//     name: 'Sample 006',
//     type: 'RNA',
//     tubesCount: 18,
//     originOrganism: 'Danio rerio',
//     sourceLab: 'Lab D',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u12345678-1234-1234-1234-123456789012',
//     createdAt: '2026-05-02T08:00:00.000Z',
//     updatedAt: '2026-05-02T08:00:00.000Z',
//     creator: {
//       id: 'u12345678-1234-1234-1234-123456789012',
//       name: 'John Doe',
//       email: 'john@example.com'
//     }
//   },
//   {
//     id: 'a7b8c9d0-e1f2-3456-ghij-789012345678',
//     name: 'Sample 007',
//     type: 'Protein',
//     tubesCount: 15,
//     originOrganism: 'Saccharomyces cerevisiae',
//     sourceLab: 'Lab A',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u45678901-1234-1234-1234-123456789015',
//     createdAt: '2026-05-01T16:30:00.000Z',
//     updatedAt: '2026-05-01T16:30:00.000Z',
//     creator: {
//       id: 'u45678901-1234-1234-1234-123456789015',
//       name: 'Bob Wilson',
//       email: 'bob@example.com'
//     }
//   },
//   {
//     id: 'b8c9d0e1-f2a3-4567-hijk-890123456789',
//     name: 'Sample 008',
//     type: 'DNA',
//     tubesCount: 30,
//     originOrganism: 'Bos taurus',
//     sourceLab: 'Lab C',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u34567890-1234-1234-1234-123456789014',
//     createdAt: '2026-04-30T13:45:00.000Z',
//     updatedAt: '2026-04-30T13:45:00.000Z',
//     creator: {
//       id: 'u34567890-1234-1234-1234-123456789014',
//       name: 'Alice Johnson',
//       email: 'alice@example.com'
//     }
//   },
//   {
//     id: 'c9d0e1f2-a3b4-5678-ijkl-901234567890',
//     name: 'Sample 009',
//     type: 'Cell Line',
//     tubesCount: 9,
//     originOrganism: 'Homo sapiens',
//     sourceLab: 'Lab B',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u23456789-1234-1234-1234-123456789013',
//     createdAt: '2026-04-29T10:00:00.000Z',
//     updatedAt: '2026-04-29T10:00:00.000Z',
//     creator: {
//       id: 'u23456789-1234-1234-1234-123456789013',
//       name: 'Jane Smith',
//       email: 'jane@example.com'
//     }
//   },
//   {
//     id: 'd0e1f2a3-b4c5-6789-jklm-012345678901',
//     name: 'Sample 010',
//     type: 'RNA',
//     tubesCount: 21,
//     originOrganism: 'Arabidopsis thaliana',
//     sourceLab: 'Lab D',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u12345678-1234-1234-1234-123456789012',
//     createdAt: '2026-04-28T15:20:00.000Z',
//     updatedAt: '2026-04-28T15:20:00.000Z',
//     creator: {
//       id: 'u12345678-1234-1234-1234-123456789012',
//       name: 'John Doe',
//       email: 'john@example.com'
//     }
//   },
//   {
//     id: 'e1f2a3b4-c5d6-7890-klmn-123456789012',
//     name: 'Sample 011',
//     type: 'Protein',
//     tubesCount: 3,
//     originOrganism: 'Mus musculus',
//     sourceLab: 'Lab A',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u45678901-1234-1234-1234-123456789015',
//     createdAt: '2026-04-27T09:30:00.000Z',
//     updatedAt: '2026-04-27T09:30:00.000Z',
//     creator: {
//       id: 'u45678901-1234-1234-1234-123456789015',
//       name: 'Bob Wilson',
//       email: 'bob@example.com'
//     }
//   },
//   {
//     id: 'f2a3b4c5-d6e7-8901-lmno-234567890123',
//     name: 'Sample 012',
//     type: 'DNA',
//     tubesCount: 48,
//     originOrganism: 'Homo sapiens',
//     sourceLab: 'Lab C',
//     groupId: 'g12345678-1234-1234-1234-123456789012',
//     createdBy: 'u34567890-1234-1234-1234-123456789014',
//     createdAt: '2026-04-26T12:00:00.000Z',
//     updatedAt: '2026-04-26T12:00:00.000Z',
//     creator: {
//       id: 'u34567890-1234-1234-1234-123456789014',
//       name: 'Alice Johnson',
//       email: 'alice@example.com'
//     }
//   }
// ]

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

        <SamplesTable groupId={groupId} />
      </div>
    </div>
  )
}
