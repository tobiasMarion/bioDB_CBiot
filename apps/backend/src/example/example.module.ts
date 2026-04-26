import { Module } from '@nestjs/common'
import { ExampleController } from './example.controller'
import { ExampleService } from './example.service'
import { PrismaModule } from '../common/prisma/prisma.module'
import { AuthGuard } from '../auth/auth.guard'

@Module({
  imports: [PrismaModule],
  controllers: [ExampleController],
  providers: [ExampleService, AuthGuard]
})
export class ExampleModule {}
