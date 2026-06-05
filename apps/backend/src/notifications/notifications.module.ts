import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { InvitesModule } from './invites/invites.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { SampleSharesModule } from './sample-shares/sample-shares.module'

@Module({
  imports: [AuthModule, InvitesModule, SampleSharesModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, InvitesModule]
})
export class NotificationsModule {}
