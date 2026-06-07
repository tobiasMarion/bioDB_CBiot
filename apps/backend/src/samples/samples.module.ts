import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../common/prisma/prisma.module'
import { SampleAccessService } from './sample-access.service'
import { SamplesController } from './samples.controller'
import { SamplesService } from './samples.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SamplesController],
  providers: [SamplesService, SampleAccessService],
  exports: [SamplesService, SampleAccessService]
})
export class SamplesModule {}
