import { PrismaPg } from '@prisma/adapter-pg'
import {
  AuditAction,
  AuditEntityType,
  GroupRole,
  PrismaClient,
  SamplePermission
} from '../src/common/prisma/generated/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

// externalAuthId = SHA256(email), matching the auth-mock deterministic ID generation
const AUTH_IDS = {
  admin: '258d8dc916db8cea2cafb6c3cd0cb0246efe061421dbd83ec3a350428cabda4f',
  tobias: '00848df1f16a6a4c2c5be76f1ae5430b5f97b2e3ad2a3ea0f1f31b22292edc66',
  felipe: '12d216f5096c445e7248035ac7d85e586c647ce185aca31774ab10088f7ae51f',
  joao: 'a72badd7bb3fa438d2cb290471dae4ae9c80da96351cc328787468946ade2a88',
  rafael: '190bc4e3c0b339c01a09ae3eff8ac114d503ad3ac2f27e48c1f59b166b5a0397',
  pietro: '3b37d283bd01ff1680bd688d748a46ceaea6a25a12f6ef13a159ae6f07c7743c',
  jonas: '4c98bd036d44246f364e95f9762499bffbbcbcae1787743de49b913814d7059d'
}

async function main() {
  console.log('🌱 Starting seed...')

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
  await prisma.room.deleteMany({})
  await prisma.group.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('🧹 Database cleaned')

  // ─── Users ──────────────────────────────────────────────────────────────────
  // These match the auth-mock's mockUsers, so login works immediately after seed.

  const admin = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.admin,
      email: 'admin@example.com',
      name: 'Administrador Exemplo',
      isAdmin: true
    }
  })

  const tobias = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.tobias,
      email: 'tobias@example.com',
      name: 'Tobias Cadoná Marion',
      isAdmin: false
    }
  })

  const felipe = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.felipe,
      email: 'felipe@example.com',
      name: 'Felipe',
      isAdmin: false
    }
  })

  const joao = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.joao,
      email: 'joao@example.com',
      name: 'João',
      isAdmin: false
    }
  })

  const rafael = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.rafael,
      email: 'rafael@example.com',
      name: 'Rafael',
      isAdmin: false
    }
  })

  const pietro = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.pietro,
      email: 'pietro@example.com',
      name: 'Pietro',
      isAdmin: false
    }
  })

  const jonas = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.jonas,
      email: 'jonas@example.com',
      name: 'Jonas Martelo',
      isAdmin: false
    }
  })

  console.log('✅ 7 Users created (matching auth-mock credentials)')

  // ─── Groups ──────────────────────────────────────────────────────────────────

  const genomicsLab = await prisma.group.create({
    data: { name: 'Genomics Lab', createdBy: admin.id }
  })

  const microBio = await prisma.group.create({
    data: { name: 'Microbiology Team', createdBy: admin.id }
  })

  // Memberships: genomicsLab → tobias = LEADER, felipe = MANAGER, joão = RESEARCHER
  //              microBio   → rafael = LEADER, pietro = RESEARCHER, joão = RESEARCHER (cross-group)
  // jonas (Jonas Martelo) is intentionally NOT a member yet — he only has a pending invite below.
  // Created individually (instead of createMany) so we can capture their IDs for audit logs below.
  const membershipTobiasGenomics = await prisma.groupMembership.create({
    data: { userId: tobias.id, groupId: genomicsLab.id, role: GroupRole.LEADER }
  })
  const membershipFelipeGenomics = await prisma.groupMembership.create({
    data: { userId: felipe.id, groupId: genomicsLab.id, role: GroupRole.MANAGER }
  })
  const membershipJoaoGenomics = await prisma.groupMembership.create({
    data: { userId: joao.id, groupId: genomicsLab.id, role: GroupRole.RESEARCHER }
  })
  const membershipRafaelMicroBio = await prisma.groupMembership.create({
    data: { userId: rafael.id, groupId: microBio.id, role: GroupRole.LEADER }
  })
  const membershipPietroMicroBio = await prisma.groupMembership.create({
    data: { userId: pietro.id, groupId: microBio.id, role: GroupRole.RESEARCHER }
  })
  const membershipJoaoMicroBio = await prisma.groupMembership.create({
    data: { userId: joao.id, groupId: microBio.id, role: GroupRole.RESEARCHER }
  })

  console.log('✅ 2 Groups + memberships created')

  // ─── Rooms ───────────────────────────────────────────────────────────────────

  const roomA = await prisma.room.create({
    data: { number: '304', building: 'Prédio A', floor: 3, createdBy: admin.id }
  })

  const roomB = await prisma.room.create({
    data: { number: '210', building: 'Prédio B', floor: 2, createdBy: admin.id }
  })

  console.log('✅ 2 Rooms created')

  // ─── Freezers & Boxes ────────────────────────────────────────────────────────

  const freezer1 = await prisma.freezer.create({
    data: { name: 'Haier Biomedical DW-86L', roomId: roomA.id, createdBy: admin.id }
  })

  const freezer2 = await prisma.freezer.create({
    data: { name: 'Eppendorf CryoCube F740', roomId: roomB.id, createdBy: admin.id }
  })

  const box1 = await prisma.box.create({
    data: { label: 'BOX-2024-0038', freezerId: freezer1.id, createdBy: tobias.id }
  })
  const box2 = await prisma.box.create({
    data: { label: 'BOX-2024-0039', freezerId: freezer1.id, createdBy: tobias.id }
  })
  const box3 = await prisma.box.create({
    data: { label: 'BOX-2024-0040', freezerId: freezer1.id, createdBy: tobias.id }
  })
  const box4 = await prisma.box.create({
    data: { label: 'BOX-2024-0041', freezerId: freezer2.id, createdBy: rafael.id }
  })
  const box5 = await prisma.box.create({
    data: { label: 'BOX-2024-0042', freezerId: freezer2.id, createdBy: rafael.id }
  })

  console.log('✅ 2 Freezers + 5 Boxes created')

  // ─── Main test sample: covers all tube states and attribute types ─────────────

  const mainSample = await prisma.sample.create({
    data: {
      name: 'RNA-seq Extract #42',
      type: 'RNA',
      originOrganism: 'Mus musculus',
      sourceLab: 'Genomics Lab B',
      groupId: genomicsLab.id,
      createdBy: tobias.id
    }
  })

  // Tube 1 — in_storage, full attribute set (all 4 types, all 3 roles)
  const tube1 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-08-14'),
      notes: '',
      boxId: box1.id,
      row: 1,
      column: 1
    }
  })
  await prisma.tubeAttribute.createMany({
    data: [
      {
        tubeId: tube1.id,
        key: 'volume_ul',
        value: '250',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      },
      {
        tubeId: tube1.id,
        key: 'concentration',
        value: '1.024',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      },
      {
        tubeId: tube1.id,
        key: 'extraction_date',
        value: '2024-08-14',
        type: 'date',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      },
      {
        tubeId: tube1.id,
        key: 'qc_passed',
        value: 'true',
        type: 'boolean',
        minRequiredRoleToEdit: GroupRole.MANAGER,
        createdBy: felipe.id
      },
      {
        tubeId: tube1.id,
        key: 'freeze_cycles',
        value: '0',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.MANAGER,
        createdBy: felipe.id
      },
      {
        tubeId: tube1.id,
        key: 'authorized_by',
        value: 'Dr. Ana Souza',
        type: 'string',
        minRequiredRoleToEdit: GroupRole.LEADER,
        createdBy: tobias.id
      }
    ]
  })

  // Tube 2 — in_storage, expiring soon (warning)
  const tube2 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-06-01'),
      notes: 'Slightly turbid — monitor on next use',
      boxId: box1.id,
      row: 1,
      column: 2
    }
  })
  await prisma.tubeAttribute.create({
    data: {
      tubeId: tube2.id,
      key: 'volume_ul',
      value: '180',
      type: 'number',
      minRequiredRoleToEdit: GroupRole.RESEARCHER,
      createdBy: tobias.id
    }
  })

  // Tube 3 — checked_out by felipe (MANAGER)
  const tube3 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-12-01'),
      notes: 'Reserved for sequencing batch 12',
      checkedOutBy: felipe.id,
      checkedOutAt: new Date('2026-05-10T09:00:00Z')
    }
  })
  await prisma.tubeEvent.create({
    data: {
      tubeId: tube3.id,
      performedBy: felipe.id,
      fromBoxId: box1.id,
      fromRow: 1,
      fromColumn: 3,
      notes: 'Retirado para sequenciamento batch 12'
    }
  })
  await prisma.tubeAttribute.createMany({
    data: [
      {
        tubeId: tube3.id,
        key: 'batch_code',
        value: 'SEQ-BATCH-12',
        type: 'string',
        minRequiredRoleToEdit: GroupRole.MANAGER,
        createdBy: felipe.id
      },
      {
        tubeId: tube3.id,
        key: 'volume_ul',
        value: '250',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      }
    ]
  })

  // Tube 4 — expired, in_storage
  const tube4 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2024-03-01'),
      notes: 'Expired — quarantined 2024-03-05',
      boxId: box1.id,
      row: 2,
      column: 1
    }
  })
  await prisma.tubeAttribute.create({
    data: {
      tubeId: tube4.id,
      key: 'freeze_cycles',
      value: '4',
      type: 'number',
      minRequiredRoleToEdit: GroupRole.MANAGER,
      createdBy: felipe.id
    }
  })

  // Tube 5 — unplaced (no box assigned yet)
  await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: joao.id,
      expirationDate: new Date('2027-02-01'),
      notes: 'New aliquot — needs to be placed in storage.',
      boxId: null,
      row: null,
      column: null
    }
  })

  // Tube 6 — no expiration date set
  await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: null,
      notes: '',
      boxId: box1.id,
      row: 2,
      column: 2
    }
  })

  console.log('✅ Main test sample created with 6 tubes (all status variants + attribute types)')

  // ─── Occupy several cells in box1 with tubes from other samples ──────────────
  // This lets the Return-to-Freezer grid show "Other sample" cells correctly.

  const otherSample = await prisma.sample.create({
    data: {
      name: 'Genomic DNA Extract #7',
      type: 'Genomic DNA',
      originOrganism: 'Homo sapiens',
      sourceLab: 'Internal Lab',
      groupId: genomicsLab.id,
      createdBy: felipe.id
    }
  })

  const otherPositions = [
    [1, 4],
    [1, 6],
    [2, 4],
    [2, 7],
    [3, 1],
    [3, 7],
    [4, 3],
    [5, 2],
    [5, 5],
    [6, 1],
    [6, 8],
    [7, 4],
    [8, 2],
    [8, 9]
  ]

  for (const [r, c] of otherPositions) {
    await prisma.tube.create({
      data: {
        sampleId: otherSample.id,
        createdBy: felipe.id,
        expirationDate: new Date('2027-01-01'),
        boxId: box1.id,
        row: r,
        column: c
      }
    })
  }

  console.log('✅ Other-sample tubes created in box1 (for occupancy grid testing)')

  // ─── Additional samples to populate the samples list ────────────────────────

  const sampleTypes = ['Genomic DNA', 'Plasmid DNA', 'Total RNA', 'Protein Extract', 'Cell Line']
  const organisms = [
    'Homo sapiens',
    'Mus musculus',
    'Escherichia coli',
    'Saccharomyces cerevisiae',
    'Arabidopsis thaliana'
  ]

  let row = 1
  let col = 3
  let boxIndex = 1
  const allBoxes = [box2, box3, box4, box5]

  for (let i = 1; i <= 20; i++) {
    const group = i % 3 === 0 ? microBio : genomicsLab
    const creator =
      group === microBio ? [rafael, pietro, joao][i % 3] : [tobias, felipe, joao][i % 3]

    const sample = await prisma.sample.create({
      data: {
        name: `Sample ${String(i).padStart(3, '0')} — ${sampleTypes[i % sampleTypes.length]}`,
        type: sampleTypes[i % sampleTypes.length],
        originOrganism: organisms[i % organisms.length],
        sourceLab: i % 2 === 0 ? 'External Partner' : 'Internal Lab',
        groupId: group.id,
        createdBy: creator.id
      }
    })

    const tubeCount = (i % 3) + 1
    for (let t = 0; t < tubeCount; t++) {
      if (boxIndex >= allBoxes.length) break

      const currentBox = allBoxes[boxIndex]
      await prisma.tube.create({
        data: {
          sampleId: sample.id,
          createdBy: creator.id,
          expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 6 + (i % 18))),
          boxId: currentBox.id,
          row,
          column: col
        }
      })

      col++
      if (col > 12) {
        col = 1
        row++
      }
      if (row > 8) {
        row = 1
        boxIndex++
      }
    }
  }

  console.log('✅ 20 additional samples created for the samples list')

  // ─── Shared sample ───────────────────────────────────────────────────────────

  const mainSampleShare = await prisma.sampleShare.create({
    data: {
      sampleId: mainSample.id,
      targetGroupId: microBio.id,
      permission: SamplePermission.VIEW,
      sharedBy: tobias.id
    }
  })

  console.log('✅ 1 Sample share created (mainSample shared to microBio)')

  // ─── Pending invite ──────────────────────────────────────────────────────────

  const jonasInvite = await prisma.groupInvite.create({
    data: {
      groupId: genomicsLab.id,
      invitedUserId: jonas.id,
      invitedBy: tobias.id,
      role: GroupRole.MANAGER,
      status: 'PENDING'
    }
  })

  // ─── Audit logs ──────────────────────────────────────────────────────────────
  // Spread across both groups (and admin-only entities) and over the last ~30 days,
  // so the audit screens can be exercised against group-scoping rules, entity type
  // filters, action filters, user filters and date-range filters.

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

  await prisma.auditLog.createMany({
    data: [
      // ── Groups (visible to LEADER of each group, and to admin) ──
      {
        entityType: AuditEntityType.GROUP,
        entityId: genomicsLab.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Genomics Lab' },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.GROUP,
        entityId: microBio.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Microbiology Team' },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.GROUP,
        entityId: genomicsLab.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: { name: { from: 'Genomics Laboratory', to: 'Genomics Lab' } },
        createdAt: daysAgo(18)
      },

      // ── Memberships (visible per-group; only their own group's members) ──
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipTobiasGenomics.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { userId: tobias.id, groupId: genomicsLab.id, role: 'LEADER' },
        createdAt: daysAgo(29)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipJoaoGenomics.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { userId: joao.id, groupId: genomicsLab.id, role: 'RESEARCHER' },
        createdAt: daysAgo(27)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipFelipeGenomics.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: { role: { from: 'RESEARCHER', to: 'MANAGER' } },
        createdAt: daysAgo(20)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipRafaelMicroBio.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { userId: rafael.id, groupId: microBio.id, role: 'LEADER' },
        createdAt: daysAgo(28)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipPietroMicroBio.id,
        performedBy: rafael.id,
        action: AuditAction.CREATE,
        changes: { userId: pietro.id, groupId: microBio.id, role: 'RESEARCHER' },
        createdAt: daysAgo(25)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipJoaoMicroBio.id,
        performedBy: rafael.id,
        action: AuditAction.CREATE,
        changes: { userId: joao.id, groupId: microBio.id, role: 'RESEARCHER' },
        createdAt: daysAgo(24)
      },

      // ── Invite (genomicsLab only) ──
      {
        entityType: AuditEntityType.INVITE,
        entityId: jonasInvite.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { invitedUserId: jonas.id, role: 'MANAGER', status: 'PENDING' },
        createdAt: daysAgo(5)
      },

      // ── Samples (genomicsLab) ──
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: mainSample.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { name: 'RNA-seq Extract #42', type: 'RNA', groupId: genomicsLab.id },
        createdAt: daysAgo(15)
      },
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: mainSample.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: { sourceLab: { from: 'Genomics Lab A', to: 'Genomics Lab B' } },
        createdAt: daysAgo(9)
      },
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: otherSample.id,
        performedBy: felipe.id,
        action: AuditAction.CREATE,
        changes: { name: 'Genomic DNA Extract #7', type: 'Genomic DNA', groupId: genomicsLab.id },
        createdAt: daysAgo(14)
      },

      // ── Share (visible both to the sharing group and the receiving group) ──
      {
        entityType: AuditEntityType.SHARE,
        entityId: mainSampleShare.id,
        performedBy: tobias.id,
        action: AuditAction.SHARE,
        changes: { sampleId: mainSample.id, targetGroupId: microBio.id, permission: 'VIEW' },
        createdAt: daysAgo(7)
      },

      // ── Tubes (genomicsLab, via mainSample) ──
      {
        entityType: AuditEntityType.TUBE,
        entityId: tube1.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { sampleId: mainSample.id, expirationDate: '2026-08-14' },
        createdAt: daysAgo(15)
      },
      {
        entityType: AuditEntityType.TUBE,
        entityId: tube3.id,
        performedBy: felipe.id,
        action: AuditAction.MOVE,
        changes: { fromBoxId: box1.id, fromRow: 1, fromColumn: 3, toBoxId: null },
        createdAt: daysAgo(3)
      },
      {
        entityType: AuditEntityType.TUBE,
        entityId: tube3.id,
        performedBy: felipe.id,
        action: AuditAction.HANDLE,
        changes: { status: { from: 'in_storage', to: 'checked_out' } },
        createdAt: daysAgo(3)
      },
      {
        entityType: AuditEntityType.TUBE,
        entityId: tube4.id,
        performedBy: joao.id,
        action: AuditAction.UPDATE,
        changes: { notes: { from: '', to: 'Expired — quarantined 2024-03-05' } },
        createdAt: daysAgo(2)
      },

      // ── Admin-only entities (USER, FREEZER, ROOM) — only visible on /audit-logs ──
      {
        entityType: AuditEntityType.USER,
        entityId: tobias.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { email: 'tobias@example.com', name: 'Tobias Cadoná Marion' },
        createdAt: daysAgo(31)
      },
      {
        entityType: AuditEntityType.USER,
        entityId: jonas.id,
        performedBy: admin.id,
        action: AuditAction.UPDATE,
        changes: {
          isAdmin: { from: false, to: false },
          name: { from: 'Jonas Marteloni', to: 'Jonas Martelo' }
        },
        createdAt: daysAgo(12)
      },
      {
        entityType: AuditEntityType.ROOM,
        entityId: roomA.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { number: '304', building: 'Prédio A', floor: 3 },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.ROOM,
        entityId: roomB.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { number: '210', building: 'Prédio B', floor: 2 },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.FREEZER,
        entityId: freezer1.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Haier Biomedical DW-86L', roomId: roomA.id },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.FREEZER,
        entityId: freezer2.id,
        performedBy: admin.id,
        action: AuditAction.UPDATE,
        changes: { name: { from: 'Eppendorf CryoCube F540', to: 'Eppendorf CryoCube F740' } },
        createdAt: daysAgo(22)
      }
    ]
  })

  console.log(
    '✅ Audit logs created (24 entries spanning both groups, admin-only entities, and ~30 days)'
  )
  console.log('')
  console.log('✨ Seed complete! Credentials for login:')
  console.log('   admin@example.com  (password: any)  → admin, no group membership needed')
  console.log('   tobias@example.com (password: any)  → LEADER     in Genomics Lab')
  console.log('   felipe@example.com (password: any)  → MANAGER    in Genomics Lab')
  console.log(
    '   joao@example.com   (password: any)  → RESEARCHER in Genomics Lab + Microbiology Team'
  )
  console.log('   rafael@example.com (password: any)  → LEADER     in Microbiology Team')
  console.log('   pietro@example.com (password: any)  → RESEARCHER in Microbiology Team')
  console.log(
    '   jonas@example.com  (password: any)  → no group yet, has a pending invite to Genomics Lab (MANAGER)'
  )
  console.log('')
  console.log('   Main test sample: "RNA-seq Extract #42" in Genomics Lab')
  console.log('   Tube statuses: in_storage (×4), checked_out (×1, by felipe), unplaced (×1)')
  console.log(
    '   Attribute types: number, string, date, boolean — roles: RESEARCHER, MANAGER, LEADER'
  )
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
