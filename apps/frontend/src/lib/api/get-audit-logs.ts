import { apiClient } from './api-client'

export type AuditEntityType =
  | 'SAMPLE'
  | 'TUBE'
  | 'GROUP'
  | 'SHARE'
  | 'USER'
  | 'FREEZER'
  | 'MEMBERSHIP'
  | 'INVITE'
  | 'ROOM'

export type AuditAction = 'CREATE' | 'UPDATE' | 'ARCHIVE' | 'MOVE' | 'HANDLE' | 'SHARE'

export type AuditLog = {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  changes: Record<string, unknown>
  performedBy: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

export type GetAuditLogsParams = {
  entityType?: AuditEntityType
  entityId?: string
  action?: AuditAction
  performedBy?: string
  search?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}

export type GetAuditLogsResponse = {
  data: AuditLog[]
  total: number
  page: number
  pageSize: number
}

export function getAuditLogs(params?: GetAuditLogsParams) {
  return apiClient
    .get('audit-logs', { searchParams: params as Record<string, string | number | boolean> })
    .json<GetAuditLogsResponse>()
}
