import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { auditNotify } from '../../auth/audit.utils'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class TubeExpirationService {
  private readonly logger = new Logger(TubeExpirationService.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async checkExpiringTubes() {
    this.logger.log('Running tube expiration check...')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tubes = await this.prisma.tube.findMany({
      where: {
        isArchived: false,
        expirationDate: { not: null }
      },
      select: {
        id: true,
        expirationDate: true,
        daysBeforeNotification: true,
        createdBy: true,
        expirationNotification: { select: { id: true, isResolved: true } },
        sample: {
          select: {
            groupId: true
          }
        }
      }
    })

    let created = 0

    for (const tube of tubes) {
      if (!tube.expirationDate) continue

      const expiration = new Date(tube.expirationDate)
      expiration.setHours(0, 0, 0, 0)

      const daysUntilExpiration = Math.floor(
        (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      const shouldNotify = daysUntilExpiration <= tube.daysBeforeNotification

      if (!shouldNotify) continue

      if (tube.expirationNotification && !tube.expirationNotification.isResolved) continue

      await this.createExpirationNotification(tube.id, tube.createdBy, tube.sample.groupId)
      created++
    }

    this.logger.log(`Tube expiration check complete. Created ${created} new notification(s).`)
  }

  private async createExpirationNotification(
    tubeId: string,
    tubeCreatorId: string,
    groupId: string
  ) {
    const [leaders, admins] = await Promise.all([
      this.prisma.groupMembership.findMany({
        where: { groupId, role: 'LEADER', isArchived: false },
        select: { userId: true }
      }),
      this.prisma.user.findMany({
        where: { isAdmin: true, isArchived: false },
        select: { id: true }
      })
    ])

    const recipientIds = [
      ...new Set([...leaders.map(l => l.userId), ...admins.map(a => a.id), tubeCreatorId])
    ]

    await this.prisma.$transaction(async tx => {
      const notification = await tx.tubeExpirationNotification.upsert({
        where: { tubeId },
        update: { isResolved: false, resolvedAt: null, createdAt: new Date() },
        create: { tubeId }
      })

      await tx.tubeExpirationNotificationRecipient.deleteMany({
        where: { notificationId: notification.id }
      })

      await tx.tubeExpirationNotificationRecipient.createMany({
        data: recipientIds.map(userId => ({ notificationId: notification.id, userId }))
      })

      await tx.auditLog.create({
        data: auditNotify({
          entityType: 'TUBE',
          entityId: tubeId,
          message: 'System notified users about tube approaching or past expiration date',
          recipientIds
        })
      })
    })
  }

  async resolveExpirationNotification(tubeId: string) {
    const notification = await this.prisma.tubeExpirationNotification.findUnique({
      where: { tubeId }
    })

    if (!notification || notification.isResolved) return

    await this.prisma.tubeExpirationNotification.update({
      where: { tubeId },
      data: { isResolved: true, resolvedAt: new Date() }
    })
  }
}
