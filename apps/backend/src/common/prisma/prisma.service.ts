import 'dotenv/config'
import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!process.env.DATABASE_URL) {
      console.log(process.env.DATABASE_URL)
      throw new Error('Provide a DB Connection string')
    }
    const adapter = new PrismaPg(process.env.DATABASE_URL)
    super({ adapter })
  }
}
