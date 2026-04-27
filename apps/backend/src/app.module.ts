import { Module } from '@nestjs/common'
import { PrismaModule } from './common/prisma/prisma.module'
import { ExampleModule } from './example/example.module'

@Module({
  imports: [PrismaModule, ExampleModule],
  controllers: [],
  providers: []
})
export class AppModule {}
