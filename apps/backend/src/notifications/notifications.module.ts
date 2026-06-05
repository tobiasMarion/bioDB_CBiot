import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { InvitesModule } from './invites/invites.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [AuthModule, InvitesModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, InvitesModule]
})
export class NotificationsModule {}
