import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { AuditEntityType, Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import type { GetAuditFilter } from './dto/GetAuditFilter'

// Tipos de entidade visíveis no contexto de grupo.
// USER, FREEZER e ROOM são exclusivos do admin.
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
  // Retorna um array de condições Prisma prontas para usar num OR.
  //
  // Por exemplo, para SAMPLE retorna:
  //   { entityType: 'SAMPLE', entityId: { in: ['id1', 'id2', ...] } }
  //
  // O Promise.all no final executa todas as queries em paralelo (ao mesmo tempo),
  // em vez de uma por vez — igual ao que o samples service faz com [samples, total].
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
        const rows = await this.prisma.sample.findMany({ where: { groupId }, select: { id: true } })
        return { entityType: AuditEntityType.SAMPLE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.TUBE]: async () => {
        // Tube não tem groupId direto — precisa navegar pela relação sample.groupId
        const rows = await this.prisma.tube.findMany({
          where: { sample: { groupId } },
          select: { id: true },
        })
        return { entityType: AuditEntityType.TUBE, entityId: { in: rows.map(r => r.id) } }
      },
      [AuditEntityType.SHARE]: async () => {
        // Share aparece para o grupo que compartilhou (sample.groupId) E para o que recebeu (targetGroupId)
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
      // Estes três nunca são chamados no contexto de grupo (GROUP_ENTITY_TYPES não os inclui),
      // mas o TypeScript exige que o Record cubra todos os valores do enum.
      [AuditEntityType.USER]: async () => ({ entityType: AuditEntityType.USER, entityId: '' }),
      [AuditEntityType.FREEZER]: async () => ({ entityType: AuditEntityType.FREEZER, entityId: '' }),
      [AuditEntityType.ROOM]: async () => ({ entityType: AuditEntityType.ROOM, entityId: '' }),
    }

    return Promise.all(types.map(type => resolvers[type]()))
  }

  // Busca samples pelo nome e retorna os IDs deles + IDs dos tubes relacionados.
  // groupId é opcional: no contexto de grupo, restringe a busca ao grupo.
  //
  // Por que tubes também? Porque o usuário pode querer ver todos os logs
  // de manipulação dos tubos de uma amostra pesquisando só pelo nome da amostra.
  private async resolveSearchIds(search: string, groupId?: string): Promise<string[]> {
    const samples = await this.prisma.sample.findMany({
      where: {
        name: { contains: search, mode: 'insensitive' },
        ...(groupId ? { groupId } : {}),  // spread condicional: só adiciona groupId se fornecido
      },
      select: {
        id: true,
        tubes: { select: { id: true } },  // inclui os tubes de cada sample
      },
    })

    const sampleIds = samples.map(s => s.id)
    const tubeIds = samples.flatMap(s => s.tubes.map(t => t.id))  // flatMap "achata" o array de arrays
    return [...sampleIds, ...tubeIds]
  }

  // Filtros que existem nos dois endpoints (grupo e admin).
  // Retorna um array de condições para adicionar no AND principal.
  private buildCommonConditions(params: GetAuditFilter): Prisma.AuditLogWhereInput[] {
    const conditions: Prisma.AuditLogWhereInput[] = []

    if (params?.action) conditions.push({ action: params.action })
    if (params?.performedBy) conditions.push({ performedBy: params.performedBy })

    // Filtro de intervalo de datas sobre createdAt.
    // "gte" = greater than or equal (>=), "lte" = less than or equal (<=).
    // new Date() converte a string ISO para o tipo Date que o Prisma espera.
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

    // Começa com os filtros comuns (action, performedBy, from, to)
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

    // Se não há condições, where fica vazio (retorna tudo)
    const where: Prisma.AuditLogWhereInput = conditions.length > 0 ? { AND: conditions } : {}

    try {
      const [data, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: params?.sortOrder ?? 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          // include traz dados relacionados — aqui os dados do usuário que fez a ação
          include: { user: { select: { id: true, name: true, email: true } } },
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

    // Valida que o entityType pedido é permitido no contexto de grupo
    if (params?.entityType && !GROUP_ENTITY_TYPES.has(params.entityType)) {
      throw new BadRequestException(`Entity type "${params.entityType}" is not available in group audit`)
    }

    const page = params?.page ?? 1
    const pageSize = Math.min(params?.pageSize ?? 50, 100)

    // Se entityType foi especificado, busca só aquele tipo; caso contrário busca todos os 6
    const typesToFetch = params?.entityType ? [params.entityType] : [...GROUP_ENTITY_TYPES]

    // Busca os IDs de cada tipo em paralelo
    const entityConditions = await this.resolveGroupEntityConditions(groupId, typesToFetch)

    // O OR garante que só logs de entidades desse grupo apareçam
    const conditions: Prisma.AuditLogWhereInput[] = [
      { OR: entityConditions },
      ...this.buildCommonConditions(params),
    ]

    if (params?.entityId) conditions.push({ entityId: params.entityId })

    if (params?.search) {
      // Passa groupId para restringir a busca de samples ao grupo
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
