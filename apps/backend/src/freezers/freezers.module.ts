import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BoxesModule } from '../boxes/boxes.module'
import { FreezersController } from './freezers.controller'
import { FreezersService } from './freezers.service'

@Module({
  imports: [AuthModule, BoxesModule],
  controllers: [FreezersController],
  providers: [FreezersService]
})
export class FreezersModule {}
