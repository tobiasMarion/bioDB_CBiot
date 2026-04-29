import { Module } from '@nestjs/common';
import { FreezersController } from './freezers.controller';
import { FreezersService } from './freezers.service';

@Module({
  controllers: [FreezersController],
  providers: [FreezersService]
})
export class FreezersModule {}
