import { PrismaPg } from '@prisma/adapter-pg'
import {
  AuditAction,
  AuditEntityType,
  GroupRole,
  InviteStatus,
  PrismaClient,
  SamplePermission,
  type Box,
  type Freezer
} from '../src/common/prisma/generated/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
  console.log('🌱 Starting rich database seed...')

  await prisma.auditLog.deleteMany({})
  await prisma.tubeAttribute.deleteMany({})
  await prisma.tubeEvent.deleteMany({})
  await prisma.sampleShare.deleteMany({})
  await prisma.groupInvite.deleteMany({})
  await prisma.groupMembership.deleteMany({})
  await prisma.tube.deleteMany({})
  await prisma.sample.deleteMany({})
  await prisma.box.deleteMany({})
  await prisma.freezer.deleteMany({})
  await prisma.group.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('🧹 Database successfully cleaned')

  const admin = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|admin_01',
      email: 'admin@cbiot.ufrgs.br',
      name: 'Admin System',
      isAdmin: true
    }
  })

  const alice = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|user_alice',
      email: 'alice.researcher@cbiot.ufrgs.br',
      name: 'Alice Smith',
      isAdmin: false
    }
  })

  const bob = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|user_bob',
      email: 'bob.technician@cbiot.ufrgs.br',
      name: 'Bob Johnson',
      isAdmin: false
    }
  })

  const charlie = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|user_charlie',
      email: 'charlie.manager@cbiot.ufrgs.br',
      name: 'Charlie Brown',
      isAdmin: false
    }
  })

  const diana = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|user_diana',
      email: 'diana.guest@cbiot.ufrgs.br',
      name: 'Diana Prince',
      isAdmin: false
    }
  })

  const users = [alice, bob, charlie, diana]
  console.log(`✅ ${users.length + 1} Users created`)

  const mainLab = await prisma.group.create({
    data: { name: 'Main Research Lab', createdBy: admin.id }
  })

  const microBioGroup = await prisma.group.create({
    data: { name: 'Microbiology Team', createdBy: admin.id }
  })

  const structuralGroup = await prisma.group.create({
    data: { name: 'Structural Biology Lab', createdBy: alice.id }
  })

  const groups = [mainLab, microBioGroup, structuralGroup]
  console.log(`✅ ${groups.length} Groups created`)

  await prisma.groupMembership.createMany({
    data: [
      { userId: alice.id, groupId: mainLab.id, role: GroupRole.LEADER },
      { userId: bob.id, groupId: mainLab.id, role: GroupRole.RESEARCHER },
      { userId: charlie.id, groupId: microBioGroup.id, role: GroupRole.MANAGER },
      { userId: diana.id, groupId: structuralGroup.id, role: GroupRole.RESEARCHER }
    ]
  })

  await prisma.groupInvite.create({
    data: {
      groupId: microBioGroup.id,
      invitedUserId: alice.id,
      invitedBy: charlie.id,
      role: GroupRole.RESEARCHER,
      status: InviteStatus.PENDING
    }
  })

  const freezers: Freezer[] = []
  const boxes: Box[] = []

  for (let i = 1; i <= 3; i++) {
    const freezer = await prisma.freezer.create({
      data: {
        name: `Freezer -80C 0${i}`,
        locationDescription: `Equipment Room ${100 + i}`,
        createdBy: admin.id
      }
    })
    freezers.push(freezer)

    for (let j = 1; j <= 4; j++) {
      const box = await prisma.box.create({
        data: {
          label: `BOX-${freezer.name.split(' ').pop()}-0${j}`,
          freezerId: freezer.id,
          createdBy: users[j % users.length].id
        }
      })
      boxes.push(box)
    }
  }
  console.log(`✅ ${freezers.length} Freezers and ${boxes.length} Boxes created`)

  const sampleTypes = ['Genomic DNA', 'Plasmid DNA', 'Total RNA', 'Protein Extract', 'Cell Line']
  const organisms = [
    'Homo sapiens',
    'Mus musculus',
    'Escherichia coli',
    'Saccharomyces cerevisiae',
    'Arabidopsis thaliana'
  ]

  let boxIndex = 0
  let row = 1
  let col = 1
  const maxRows = 8
  const maxCols = 12

  let totalTubes = 0

  for (let i = 1; i <= 50; i++) {
    const randomGroup = groups[i % groups.length]
    const randomUser = users[i % users.length]

    const sample = await prisma.sample.create({
      data: {
        name: `Sample ${String(i).padStart(3, '0')} - ${sampleTypes[i % sampleTypes.length].split(' ')[0]}`,
        type: sampleTypes[i % sampleTypes.length],
        originOrganism: organisms[i % organisms.length],
        sourceLab: i % 3 === 0 ? 'External Partner' : 'Internal Lab',
        groupId: randomGroup.id,
        createdBy: randomUser.id
      }
    })

    const tubesCount = (i % 4) + 1
    for (let t = 0; t < tubesCount; t++) {
      if (boxIndex >= boxes.length) break

      const currentBox = boxes[boxIndex]

      const tube = await prisma.tube.create({
        data: {
          sampleId: sample.id,
          createdBy: randomUser.id,
          expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + (i % 5))),
          boxId: currentBox.id,
          row: row,
          column: col
        }
      })
      totalTubes++

      col++
      if (col > maxCols) {
        col = 1
        row++
      }
      if (row > maxRows) {
        row = 1
        boxIndex++
      }

      if (t === 0) {
        await prisma.tubeAttribute.createMany({
          data: [
            {
              tubeId: tube.id,
              key: 'Concentration (ng/uL)',
              value: String(Math.floor(Math.random() * 500) + 10),
              createdBy: randomUser.id
            },
            {
              tubeId: tube.id,
              key: 'Purity 260/280',
              value: (1.7 + Math.random() * 0.3).toFixed(2),
              createdBy: randomUser.id
            }
          ]
        })
      }

      if (i % 5 === 0) {
        await prisma.tubeEvent.create({
          data: {
            tubeId: tube.id,
            performedBy: admin.id,
            toBoxId: currentBox.id,
            toRow: row,
            toColumn: col,
            lab: 'Central Facility',
            notes: 'Transferred during routine freezer maintenance.'
          }
        })
      }
    }
  }
  console.log(`✅ 50 Samples and ${totalTubes} Tubes created and physically allocated`)

  const samplesToShare = await prisma.sample.findMany({ take: 5, where: { groupId: mainLab.id } })
  for (const sample of samplesToShare) {
    await prisma.sampleShare.create({
      data: {
        sampleId: sample.id,
        targetGroupId: microBioGroup.id,
        permission: SamplePermission.VIEW,
        sharedBy: alice.id
      }
    })
  }
  console.log('✅ Sample shares established')

  await prisma.auditLog.create({
    data: {
      entityType: AuditEntityType.GROUP,
      entityId: mainLab.id,
      performedBy: admin.id,
      action: AuditAction.CREATE,
      changes: { name: 'Main Research Lab' }
    }
  })

  console.log('✅ Audit logs generated')
  console.log('✨ Seeding process completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
