import { Module } from '@nestjs/common'
import { PrismaModule } from './common/prisma/prisma.module'
import { ExampleModule } from './example/example.module'
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [PrismaModule, ExampleModule, GroupsModule],
  controllers: [],
  providers: []
})
export class AppModule {}
