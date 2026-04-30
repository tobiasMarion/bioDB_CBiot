import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { FreezersController } from './freezers.controller'
import { FreezersService } from './freezers.service'

@Module({
  imports: [AuthModule],
  controllers: [FreezersController],
  providers: [FreezersService]
})
export class FreezersModule {}
