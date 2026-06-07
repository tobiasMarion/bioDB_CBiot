import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { AuditEntityType, Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import type { GetAuditFilter } from './dto/GetAuditFilter'

// Tipos de entidade visíveis no contexto de grupo.
const GROUP_ENTITY_TYPES = new Set<AuditEntityType>([
  AuditEntityType.SAMPLE,
  AuditEntityType.TUBE,
  AuditEntityType.GROUP,
  AuditEntityType.SHARE,
  AuditEntityType.MEMBERSHIP,
  AuditEntityType.INVITE,
])

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  // Dado um groupId, descobre quais IDs de cada entityType pertencem a esse grupo.
  private async resolveGroupEntityConditions(
    groupId: string,
    types: AuditEntityType[]
  ): Promise<Prisma.AuditLogWhereInput[]> {
    const resolvers: Record<AuditEntityType, () => Promise<Prisma.AuditLogWhereInput>> = {
      [AuditEntityType.GROUP]: async () => ({
        entityType: AuditEntityType.GROUP,
        entityId: groupId,
      }),
      [AuditEntityType.SAMPLE]: async () => {
        const rows = await this.prisma.sample.findMany({
          where: {
            OR: [
              { groupId },
              { shares: { some: { targetGroupId: groupId, isArchived: false } } },
            ],
          },
          select: { id: true },
        })
        return { entityType: AuditEntityType.SAMPLE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.TUBE]: async () => {
        // Tube não tem groupId direto — navega pela relação com sample
        const rows = await this.prisma.tube.findMany({
          where: {
            sample: {
              OR: [
                { groupId },
                { shares: { some: { targetGroupId: groupId, isArchived: false } } },
              ],
            },
          },
          select: { id: true },
        })
        return { entityType: AuditEntityType.TUBE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.SHARE]: async () => {
        const rows = await this.prisma.sampleShare.findMany({
          where: { OR: [{ sample: { groupId } }, { targetGroupId: groupId }] },
          select: { id: true },
        })
        return { entityType: AuditEntityType.SHARE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.MEMBERSHIP]: async () => {
        const rows = await this.prisma.groupMembership.findMany({ where: { groupId }, select: { id: true } })
        return { entityType: AuditEntityType.MEMBERSHIP, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.INVITE]: async () => {
        const rows = await this.prisma.groupInvite.findMany({ where: { groupId }, select: { id: true } })
        return { entityType: AuditEntityType.INVITE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.USER]: async () => ({ entityType: AuditEntityType.USER, entityId: '' }),
      [AuditEntityType.FREEZER]: async () => ({ entityType: AuditEntityType.FREEZER, entityId: '' }),
      [AuditEntityType.ROOM]: async () => ({ entityType: AuditEntityType.ROOM, entityId: '' }),
    }

    return Promise.all(types.map(type => resolvers[type]()))
  }

  // Busca samples pelo nome ou ID e retorna os IDs deles + IDs dos tubes relacionados.
  private async resolveSearchIds(search: string, groupId?: string): Promise<string[]> {
    const samples = await this.prisma.sample.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { id: { startsWith: search } },
            ],
          },
          ...(groupId
            ? [{
                OR: [
                  { groupId },
                  { shares: { some: { targetGroupId: groupId, isArchived: false } } },
                ],
              }]
            : []),
        ],
      },
      select: {
        id: true,
        tubes: { select: { id: true } },
      },
    })

    const sampleIds = samples.map(s => s.id)
    const tubeIds = samples.flatMap(s => s.tubes.map(t => t.id))
    return [...sampleIds, ...tubeIds]
  }

  private buildCommonConditions(params: GetAuditFilter): Prisma.AuditLogWhereInput[] {
    const conditions: Prisma.AuditLogWhereInput[] = []

    if (params?.action) conditions.push({ action: params.action })
    if (params?.performedBy) conditions.push({ performedBy: params.performedBy })

    if (params?.from || params?.to) {
      conditions.push({
        createdAt: {
          ...(params.from ? { gte: new Date(params.from) } : {}),
          ...(params.to ? { lte: new Date(params.to) } : {}),
        },
      })
    }

    return conditions
  }

  async findAllAdmin(user: User, params: GetAuditFilter) {
    await this.auth.assert({ user, permission: 'VIEW_ADMIN_AUDIT' })

    const page = params?.page ?? 1
    const pageSize = Math.min(params?.pageSize ?? 50, 100)

    const conditions: Prisma.AuditLogWhereInput[] = [...this.buildCommonConditions(params)]

    if (params?.entityType) conditions.push({ entityType: params.entityType })
    if (params?.entityId) conditions.push({ entityId: params.entityId })

    if (params?.search) {
      const ids = await this.resolveSearchIds(params.search)
      conditions.push({
        OR: [
          { entityId: { startsWith: params.search } },
          { entityId: { in: ids } },
        ],
      })
    }

    const where: Prisma.AuditLogWhereInput = conditions.length > 0 ? { AND: conditions } : {}

    try {
      const [data, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: params?.sortOrder ?? 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { user: { select: { id: true, name: true, email: true } } }, // dados do usuário que fez a ação
        }),
        this.prisma.auditLog.count({ where }),
      ])

      return { data, total, page, pageSize }
    } catch {
      throw new InternalServerErrorException('Failed to fetch audit logs')
    }
  }

  async findAllByGroup(groupId: string, user: User, params: GetAuditFilter) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP_AUDIT', groupId })

    if (params?.entityType && !GROUP_ENTITY_TYPES.has(params.entityType)) {
      throw new BadRequestException(`Entity type "${params.entityType}" is not available in group audit`)
    }

    const page = params?.page ?? 1
    const pageSize = Math.min(params?.pageSize ?? 50, 100)

    const typesToFetch = params?.entityType ? [params.entityType] : [...GROUP_ENTITY_TYPES]

    const entityConditions = await this.resolveGroupEntityConditions(groupId, typesToFetch)

    const conditions: Prisma.AuditLogWhereInput[] = [
      { OR: entityConditions },
      ...this.buildCommonConditions(params),
    ]

    if (params?.entityId) conditions.push({ entityId: params.entityId })

    if (params?.search) {
      const ids = await this.resolveSearchIds(params.search, groupId)
      conditions.push({
        OR: [
          { entityId: { startsWith: params.search } },
          { entityId: { in: ids } },
        ],
      })
    }

    const where: Prisma.AuditLogWhereInput = { AND: conditions }

    try {
      const [data, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: params?.sortOrder ?? 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { user: { select: { id: true, name: true, email: true } } },
        }),
        this.prisma.auditLog.count({ where }),
      ])

      return { data, total, page, pageSize }
    } catch {
      throw new InternalServerErrorException('Failed to fetch audit logs')
    }
  }
}
