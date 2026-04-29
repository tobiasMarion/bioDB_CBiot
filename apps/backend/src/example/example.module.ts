import { Module } from '@nestjs/common'
import { AuthGuard } from '../auth/authentication.guard'
import { PrismaModule } from '../common/prisma/prisma.module'
import { ExampleController } from './example.controller'
import { ExampleService } from './example.service'

@Module({
  imports: [PrismaModule],
  controllers: [ExampleController],
  providers: [ExampleService, AuthGuard]
})
export class ExampleModule {}
