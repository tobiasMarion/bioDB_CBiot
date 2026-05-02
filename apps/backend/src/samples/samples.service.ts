import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { auditCreate, auditUpdate, auditDelete } from '../auth/audit.utils';
import { AuthorizationService } from '../auth/authorization.service';
import type { User } from '../auth/types/user.type';
import { Prisma } from '../common/prisma/generated/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSampleDTO } from './dto/CreateSample';
import { UpdateSampleDTO } from './dto/UpdateSample';

@Injectable()
export class SamplesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(data: CreateSampleDTO, groupId: string, user: User) {
    await this.auth.assert({ 
      user, 
      permission: 'CREATE_SAMPLE', 
      groupId: groupId 
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const newSample = await tx.sample.create({
          data: {
            name: data.name,
            type: data.type,
            originOrganism: data.originOrganism,
            sourceLab: data.sourceLab,
            groupId: groupId,
            createdBy: user.id,
          },
        });

        await tx.auditLog.create({
          data: auditCreate({
            entityType: 'SAMPLE',
            entityId: newSample.id,
            performedBy: user.id,
            current: newSample,
          }),
        });

        return newSample;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
           throw new NotFoundException(`Group with ID ${groupId} not found`);
        }
      }
      throw new InternalServerErrorException('Error creating sample');
    }
  }

  async findAllByGroup(groupId: string) {
    return this.prisma.sample.findMany({
      where: {
        groupId: groupId,
        isArchived: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async archive(id: string, user: User) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      select: { groupId: true }
    });

    if (!sample) throw new NotFoundException('Sample not found');

    await this.auth.assert({
      user,
      permission: 'DELETE_SAMPLE',
      groupId: sample.groupId
    });

    return await this.prisma.$transaction(async (tx) => {
      const archivedSample = await tx.sample.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: auditDelete({
          entityType: 'SAMPLE',
          entityId: id,
          performedBy: user.id,
          previous: sample,
        }),
      });

      return archivedSample;
    });
  }

  async update(id: string, data: UpdateSampleDTO, user: User) {
    const currentSample = await this.prisma.sample.findUnique({
      where: { id },
    });

    if (!currentSample) throw new NotFoundException('Sample not found');

    await this.auth.assert({
      user,
      permission: 'UPDATE_SAMPLE',
      groupId: currentSample.groupId,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedSample = await tx.sample.update({
          where: { id },
          data: {
            name: data.name,
            type: data.type,
            originOrganism: data.originOrganism,
            sourceLab: data.sourceLab,
          },
        });

        await tx.auditLog.create({
          data: auditUpdate({
            entityType: 'SAMPLE',
            entityId: id,
            performedBy: user.id,
            previous: currentSample,
            current: updatedSample,
          }),
        });

        return updatedSample;
      });
    } catch (error) {
      throw new InternalServerErrorException('Error updating sample');
    }
  }
}