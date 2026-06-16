import { Module } from '@nestjs/common'
import { AuthMockController } from './auth-mock.controller'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthorizationService } from './authorization.service'

@Module({
  providers: [AuthorizationService, AuthService],
  exports: [AuthorizationService],
  controllers: [AuthController, AuthMockController]
})
export class AuthModule {}
