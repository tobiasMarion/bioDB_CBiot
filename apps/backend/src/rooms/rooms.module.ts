import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService]
})
export class RoomsModule {}
