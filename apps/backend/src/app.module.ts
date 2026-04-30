import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { FreezersModule } from './freezers/freezers.module'
import { GroupsModule } from './groups/groups.module'

@Module({
  imports: [PrismaModule, GroupsModule, FreezersModule, AuthModule],
  controllers: [],
  providers: []
})
export class AppModule {}
