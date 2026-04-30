import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateGroupDTO } from './dto/CreateGroup'

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(data: CreateGroupDTO, user: User) {
    await this.auth.assert({ user, permission: 'CREATE_GROUP' })

    try {
      const newGroup = await this.prisma.group.create({
        data: { ...data, createdBy: user.id }
      })

      await this.prisma.auditLog.create({
        data: {
          entityType: 'GROUP',
          entityId: newGroup.id,
          performedBy: user.id,
          action: 'CREATE',
          changes: newGroup
        }
      })

      return newGroup
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('User didnt follow orders')
      }
      throw error
    }
  }

  async findUserMemberships(user: User) {
    try {
      return await this.prisma.groupMembership.findMany({
        where: {
          userId: user.id,
          isArchived: false
        },
        select: {
          id: true,
          groupId: true,
          role: true,
          joinedAt: true,
          group: {
            select: {
              name: true
            }
          }
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user memberships')
    }
  }
}
