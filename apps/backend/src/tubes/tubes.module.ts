import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../common/prisma/prisma.module'
import { TubesController } from './tubes.controller'
import { TubesService } from './tubes.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TubesController],
  providers: [TubesService]
})
export class TubesModule {}
