import { Module } from '@nestjs/common';
import { BoxService } from './box.service';
import { BoxController } from './box.controller';

@Module({
  controllers: [BoxController],
  providers: [BoxService],
})
export class BoxModule {}
