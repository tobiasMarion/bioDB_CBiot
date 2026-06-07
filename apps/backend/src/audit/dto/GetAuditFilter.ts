import type { AuditAction, AuditEntityType } from '../../common/prisma/generated/client'

export type GetAuditFilter = {
  entityType?: AuditEntityType
  action?: AuditAction
  performedBy?: string
  from?: string // ISO date string
  to?: string // ISO date string
  entityId?: string

  // Busca por nome de sample (puxa logs do sample + tubes relacionados)
  search?: string

  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}
