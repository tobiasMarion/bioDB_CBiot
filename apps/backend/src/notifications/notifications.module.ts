import { Module } from '@nestjs/common'
import { InvitesModule } from './invites/invites.module'

@Module({
  imports: [InvitesModule],
  exports: [InvitesModule]
})
export class NotificationsModule {}
