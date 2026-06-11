import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module'
import { BoxesService } from './boxes.service';
import { BoxesController } from './boxes.controller';

@Module({
  imports: [AuthModule],
  controllers: [BoxesController],
  providers: [BoxesService],
})
export class BoxesModule {}
