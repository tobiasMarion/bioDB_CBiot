import { apiClient } from './api-client'
import type { GetAuditLogsParams, GetAuditLogsResponse } from './get-audit-logs'

export function getGroupAuditLogs(groupId: string, params?: GetAuditLogsParams) {
  return apiClient
    .get(`groups/${groupId}/audit`, { searchParams: params as Record<string, string | number | boolean> })
    .json<GetAuditLogsResponse>()
}
