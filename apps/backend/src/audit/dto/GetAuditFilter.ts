import type { AuditAction, AuditEntityType } from '../../common/prisma/generated/client'

export type GetAuditFilter = {
  // Filtros comuns aos dois endpoints
  entityType?: AuditEntityType
  action?: AuditAction
  performedBy?: string   // UUID do usuário; futuramente pode ser null (ações de sistema)
  from?: string          // ISO date string, ex: "2026-01-01T00:00:00.000Z"
  to?: string            // ISO date string

  // Filtro direto por ID de entidade 
  entityId?: string

  // Busca por nome de sample (puxa logs do sample + tubes relacionados) 
  search?: string

  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}
