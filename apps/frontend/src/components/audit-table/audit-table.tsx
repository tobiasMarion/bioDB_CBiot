import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { type AuditAction, type AuditEntityType, getAuditLogs } from '@/lib/api/get-audit-logs'
import { getGroupAuditLogs } from '@/lib/api/get-group-audit-logs'
import type { User } from '@/lib/api/types/user'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AuditPagination } from './audit-pagination'
import { AuditRow } from './audit-row'
import { AuditTableSkeleton } from './audit-table-skeleton'
import { AuditToolbar, GROUP_ENTITY_TYPES } from './audit-toolbar'

interface AuditTableProps {
  groupId?: string
}

const ITEMS_PER_PAGE = 20
const SEARCH_DEBOUNCE_MS = 300

export function AuditTable({ groupId }: AuditTableProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [entityType, setEntityType] = useState<AuditEntityType | undefined>()
  const [action, setAction] = useState<AuditAction | undefined>()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Debounce na busca para não disparar uma query a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const fromISO = fromDate ? `${fromDate}T00:00:00.000Z` : undefined
  const toISO = toDate ? `${toDate}T23:59:59.999Z` : undefined

  const params = {
    search: debouncedSearch || undefined,
    entityType,
    action,
    performedBy: selectedUser?.id,
    from: fromISO,
    to: toISO,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    sortOrder: 'desc' as const
  }

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', groupId, params],
    queryFn: () => (groupId ? getGroupAuditLogs(groupId, params) : getAuditLogs(params))
  })

  const logs = data?.data ?? []
  const totalItems = data?.total ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const hasActiveFilters =
    !!search || !!entityType || !!action || !!fromDate || !!toDate || !!selectedUser

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleEntityTypeChange = (value: AuditEntityType | undefined) => {
    setEntityType(value)
    setCurrentPage(1)
  }

  const handleActionChange = (value: AuditAction | undefined) => {
    setAction(value)
    setCurrentPage(1)
  }

  const handleFromDateChange = (value: string) => {
    setFromDate(value)
    setCurrentPage(1)
  }

  const handleToDateChange = (value: string) => {
    setToDate(value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setEntityType(undefined)
    setAction(undefined)
    setFromDate('')
    setToDate('')
    setSelectedUser(null)
    setCurrentPage(1)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <AuditToolbar
        search={search}
        onSearchChange={handleSearchChange}
        entityType={entityType}
        onEntityTypeChange={handleEntityTypeChange}
        action={action}
        onActionChange={handleActionChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        selectedUser={selectedUser}
        onUserSelect={user => {
          setSelectedUser(user)
          setCurrentPage(1)
        }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        availableEntityTypes={groupId ? GROUP_ENTITY_TYPES : undefined}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-44'>Date</TableHead>
              <TableHead className='w-40'>Entity</TableHead>
              <TableHead className='w-28'>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead className='w-24 text-center'>Changes</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading ? (
            <AuditTableSkeleton />
          ) : (
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-32 text-center text-muted-foreground'>
                    {hasActiveFilters ? 'No logs match your filters.' : 'No audit logs found.'}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <AuditRow
                    key={log.id}
                    log={log}
                    isExpanded={expandedIds.has(log.id)}
                    onToggle={() => toggleExpanded(log.id)}
                  />
                ))
              )}
            </TableBody>
          )}
        </Table>
      </div>

      <AuditPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
