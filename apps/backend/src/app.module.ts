import { Module } from '@nestjs/common'
import { AuditModule } from './audit/audit.module'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { FreezersModule } from './freezers/freezers.module'
import { GroupsModule } from './groups/groups.module'
import { NotificationsModule } from './notifications/notifications.module'
import { RoomsModule } from './rooms/rooms.module'
import { SamplesModule } from './samples/samples.module'
import { TubesModule } from './tubes/tubes.module'
import { BoxesModule } from './boxes/boxes.module';

@Module({
  imports: [
    PrismaModule,
    GroupsModule,
    FreezersModule,
    AuthModule,
    NotificationsModule,
    SamplesModule,
    TubesModule,
    RoomsModule,
    AuditModule,
    BoxesModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
