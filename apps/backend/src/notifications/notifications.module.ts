import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from '../auth/auth.module'
import { InvitesModule } from './invites/invites.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { SampleSharesModule } from './sample-shares/sample-shares.module'
import { TubeExpirationModule } from './tube-expiration/tube-expiration.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    InvitesModule,
    SampleSharesModule,
    TubeExpirationModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, InvitesModule, TubeExpirationModule]
})
export class NotificationsModule {}
