import { Module } from '@nestjs/common'
import { ExampleModule } from './example/example.module'
import { PrismaModule } from './common/prisma/prisma.module'

@Module({
  imports: [PrismaModule, ExampleModule],
  controllers: [],
  providers: []
})
export class AppModule {}
