import { AuditTable } from '@/components/audit-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin/audit/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-semibold'>Admin Audit Logs</h1>
      <AuditTable />
    </div>
  )
}
