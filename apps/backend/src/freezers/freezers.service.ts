import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFreezerDTO } from './dto/CreateFreezer';
import { AuditEntityType, Prisma, User } from '../common/prisma/generated/client';

@Injectable()
export class FreezersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFreezerDTO, user: User){
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
    try{
      const newFreezer = await this.prisma.freezer.create({
        data: {...data, createdBy: user.id}
      })

      await this.prisma.auditLog.create({
        data: {
          entityType: 'FREEZER',
          entityId: newFreezer.id,
          performedBy: user.id,
          action: 'CREATE',
          changes: newFreezer
        }
      })

      return newFreezer
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('User didnt follow orders')
        }
      throw error
    }
  }

  async findAllFreezers(){
    try {
      return await this.prisma.freezer.findMany({
        where:{
          archived: false
        },
        select: {
          id: true,
          name: true,
          locationDescription: true,
          createdBy: true
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user memberships')
    }
  }
}
