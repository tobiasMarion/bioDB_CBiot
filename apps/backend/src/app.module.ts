import { Module } from '@nestjs/common'
import { PrismaModule } from './common/prisma/prisma.module'
import { ExampleModule } from './example/example.module'
import { GroupsModule } from './groups/groups.module';
import { FreezersModule } from './freezers/freezers.module';

@Module({
  imports: [PrismaModule, ExampleModule, GroupsModule, FreezersModule],
  controllers: [],
  providers: []
})
export class AppModule {}
