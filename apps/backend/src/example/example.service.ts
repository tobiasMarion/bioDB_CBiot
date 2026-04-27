import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateExampleDTO } from './dto/CreateExample'

@Injectable()
export class ExampleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExampleDTO) {
    try {
      return await this.prisma.example.create({
        data
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists')
      }

      throw error
    }
  }

  async findAll() {
    return this.prisma.example.findMany()
  }
}
