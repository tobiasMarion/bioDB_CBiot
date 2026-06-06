import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { FreezersModule } from './freezers/freezers.module'
import { GroupsModule } from './groups/groups.module'
import { InvitesModule } from './invites/invites.module'
import { SamplesModule } from './samples/samples.module'
import { TubesModule } from './tubes/tubes.module'
import { RoomsModule } from './rooms/rooms.module'
import { AuditModule } from './audit/audit.module'

@Module({
  imports: [PrismaModule, GroupsModule, FreezersModule, AuthModule, InvitesModule, SamplesModule, TubesModule, RoomsModule, AuditModule],
  controllers: [],
  providers: []
})
export class AppModule {}
