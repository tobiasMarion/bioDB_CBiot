import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { FreezersModule } from './freezers/freezers.module'
import { GroupsModule } from './groups/groups.module'
import { NotificationsModule } from './notifications/notifications.module'
import { SamplesModule } from './samples/samples.module'
import { TubesModule } from './tubes/tubes.module'
import { RoomsModule } from './rooms/rooms.module'

@Module({
  imports: [PrismaModule, GroupsModule, FreezersModule, AuthModule, NotificationsModule, SamplesModule, TubesModule, RoomsModule],
  controllers: [],
  providers: []
})
export class AppModule {}
