import { Module } from '@nestjs/common'
import { AuthModule } from '../../auth/auth.module'
import { SampleSharesController } from './sample-shares.controller'
import { SampleSharesService } from './sample-shares.service'

@Module({
  imports: [AuthModule],
  controllers: [SampleSharesController],
  providers: [SampleSharesService]
})
export class SampleSharesModule {}
