import { Module } from '@nestjs/common'
import { TubeExpirationService } from './tube-expiration.service'

@Module({
  providers: [TubeExpirationService],
  exports: [TubeExpirationService]
})
export class TubeExpirationModule {}
