import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateGroupDTO } from './dto/CreateGroup'
import { Prisma } from '../common/prisma/generated/client'
import type { User } from '../auth/types/user.type'

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGroupDTO, user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
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

  async findUserMemberships(user: User){
    try {
      return await this.prisma.groupMembership.findMany({
        where: {
          userId:user.id,
          archived: false
        },
        select: {
          id: true,
          groupId: true,
          role: true,
          joinedAt: true,
          group: {
            select: {
              name:true
            }
          }
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user memberships')
    }
  }
}
