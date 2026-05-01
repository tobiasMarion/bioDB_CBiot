import { Module } from '@nestjs/common'
import { AuthorizationService } from './authorization.service'
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthorizationService, AuthService],
  exports: [AuthorizationService],
  controllers: [AuthController]
})
export class AuthModule {}
