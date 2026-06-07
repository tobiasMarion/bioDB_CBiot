import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../common/prisma/prisma.module'
import { TubeExpirationModule } from '../notifications/tube-expiration/tube-expiration.module'
import { SamplesModule } from '../samples/samples.module'
import { TubesController } from './tubes.controller'
import { TubesService } from './tubes.service'

@Module({
  imports: [PrismaModule, AuthModule, TubeExpirationModule, SamplesModule],
  controllers: [TubesController],
  providers: [TubesService]
})
export class TubesModule {}
