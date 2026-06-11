import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateBoxDTO } from './dto/CreateBox';
import { UpdateBoxDTO } from './dto/UpdateBox';

@Injectable()
export class BoxesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(freezerId: string, data: CreateBoxDTO, user: User) {
    await this.auth.assert({
      user,
      permission: 'CREATE_BOX',
      groupId: data.groupId ?? ''
    })

    try {
      const newBox = await this.prisma.box.create({
        data: {
          freezerId,
          label: data.label,
          createdBy: user.id
        }
      })

      await this.prisma.auditLog.create({
        data: auditCreate({
          entityType: 'BOX' as any,
          entityId: newBox.id,
          performedBy: user.id,
          current: newBox
        })
      })

      return newBox
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A box with this label already exists in this freezer')
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Freezer not found')
        }
      }
      throw new InternalServerErrorException('Error creating box')
    }

  }

  findAll() {
    return `This action returns all box`;
  }

  findOne(id: number) {
    return `This action returns a #${id} box`;
  }

  update(id: number, UpdateBoxDTO: UpdateBoxDTO) {
    return `This action updates a #${id} box`;
  }

  remove(id: number) {
    return `This action removes a #${id} box`;
  }
}
