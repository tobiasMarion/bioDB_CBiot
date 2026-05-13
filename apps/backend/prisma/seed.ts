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
  lucas: '824f829edd83f32987958b29b25891ce5ea9bfae4aea3c784f7e36d8ee068397',
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

  const lucas = await prisma.user.create({
    data: {
      externalAuthId: AUTH_IDS.lucas,
      email: 'lucas@example.com',
      name: 'Lucas Silva',
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

  console.log('✅ 4 Users created (matching auth-mock credentials)')

  // ─── Groups ──────────────────────────────────────────────────────────────────

  const genomicsLab = await prisma.group.create({
    data: { name: 'Genomics Lab', createdBy: admin.id }
  })

  const microBio = await prisma.group.create({
    data: { name: 'Microbiology Team', createdBy: admin.id }
  })

  // Memberships: tobias = LEADER, lucas = MANAGER, jonas = RESEARCHER
  // This lets us test role-based restrictions on attributes and tube actions.
  await prisma.groupMembership.createMany({
    data: [
      { userId: tobias.id, groupId: genomicsLab.id, role: GroupRole.LEADER },
      { userId: lucas.id, groupId: genomicsLab.id, role: GroupRole.MANAGER },
      { userId: jonas.id, groupId: genomicsLab.id, role: GroupRole.RESEARCHER },
      { userId: lucas.id, groupId: microBio.id, role: GroupRole.LEADER },
      { userId: jonas.id, groupId: microBio.id, role: GroupRole.RESEARCHER }
    ]
  })

  console.log('✅ 2 Groups + memberships created')

  // ─── Freezers & Boxes ────────────────────────────────────────────────────────

  const freezer1 = await prisma.freezer.create({
    data: {
      name: 'Haier Biomedical DW-86L',
      locationDescription: 'Prédio A, 3º andar, sala 304',
      createdBy: admin.id
    }
  })

  const freezer2 = await prisma.freezer.create({
    data: {
      name: 'Eppendorf CryoCube F740',
      locationDescription: 'Prédio B, 2º andar, sala 210',
      createdBy: admin.id
    }
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
    data: { label: 'BOX-2024-0041', freezerId: freezer2.id, createdBy: lucas.id }
  })
  const box5 = await prisma.box.create({
    data: { label: 'BOX-2024-0042', freezerId: freezer2.id, createdBy: lucas.id }
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
      { tubeId: tube1.id, key: 'volume_ul', value: '250', type: 'number', minRequiredRoleToEdit: GroupRole.RESEARCHER, createdBy: tobias.id },
      { tubeId: tube1.id, key: 'concentration', value: '1.024', type: 'number', minRequiredRoleToEdit: GroupRole.RESEARCHER, createdBy: tobias.id },
      { tubeId: tube1.id, key: 'extraction_date', value: '2024-08-14', type: 'date', minRequiredRoleToEdit: GroupRole.RESEARCHER, createdBy: tobias.id },
      { tubeId: tube1.id, key: 'qc_passed', value: 'true', type: 'boolean', minRequiredRoleToEdit: GroupRole.MANAGER, createdBy: lucas.id },
      { tubeId: tube1.id, key: 'freeze_cycles', value: '0', type: 'number', minRequiredRoleToEdit: GroupRole.MANAGER, createdBy: lucas.id },
      { tubeId: tube1.id, key: 'authorized_by', value: 'Dr. Ana Souza', type: 'string', minRequiredRoleToEdit: GroupRole.LEADER, createdBy: tobias.id }
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
    data: { tubeId: tube2.id, key: 'volume_ul', value: '180', type: 'number', minRequiredRoleToEdit: GroupRole.RESEARCHER, createdBy: tobias.id }
  })

  // Tube 3 — checked_out by lucas (MANAGER)
  const tube3 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-12-01'),
      notes: 'Reserved for sequencing batch 12',
      checkedOutBy: lucas.id,
      checkedOutAt: new Date('2026-05-10T09:00:00Z')
    }
  })
  await prisma.tubeEvent.create({
    data: {
      tubeId: tube3.id,
      performedBy: lucas.id,
      fromBoxId: box1.id,
      fromRow: 1,
      fromColumn: 3,
      notes: 'Retirado para sequenciamento batch 12'
    }
  })
  await prisma.tubeAttribute.createMany({
    data: [
      { tubeId: tube3.id, key: 'batch_code', value: 'SEQ-BATCH-12', type: 'string', minRequiredRoleToEdit: GroupRole.MANAGER, createdBy: lucas.id },
      { tubeId: tube3.id, key: 'volume_ul', value: '250', type: 'number', minRequiredRoleToEdit: GroupRole.RESEARCHER, createdBy: tobias.id }
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
    data: { tubeId: tube4.id, key: 'freeze_cycles', value: '4', type: 'number', minRequiredRoleToEdit: GroupRole.MANAGER, createdBy: lucas.id }
  })

  // Tube 5 — unplaced (no box assigned yet)
  await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: jonas.id,
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
      createdBy: lucas.id
    }
  })

  const otherPositions = [
    [1, 4], [1, 6], [2, 4], [2, 7],
    [3, 1], [3, 7], [4, 3], [5, 2],
    [5, 5], [6, 1], [6, 8], [7, 4],
    [8, 2], [8, 9]
  ]

  for (const [r, c] of otherPositions) {
    await prisma.tube.create({
      data: {
        sampleId: otherSample.id,
        createdBy: lucas.id,
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
    'Homo sapiens', 'Mus musculus', 'Escherichia coli',
    'Saccharomyces cerevisiae', 'Arabidopsis thaliana'
  ]

  let row = 1
  let col = 3
  let boxIndex = 1
  const allBoxes = [box2, box3, box4, box5]

  for (let i = 1; i <= 20; i++) {
    const group = i % 3 === 0 ? microBio : genomicsLab
    const creator = [tobias, lucas, jonas][i % 3]

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
          expirationDate: new Date(
            new Date().setMonth(new Date().getMonth() + 6 + (i % 18))
          ),
          boxId: currentBox.id,
          row,
          column: col
        }
      })

      col++
      if (col > 12) { col = 1; row++ }
      if (row > 8) { row = 1; boxIndex++ }
    }
  }

  console.log('✅ 20 additional samples created for the samples list')

  // ─── Shared sample ───────────────────────────────────────────────────────────

  await prisma.sampleShare.create({
    data: {
      sampleId: mainSample.id,
      targetGroupId: microBio.id,
      permission: SamplePermission.VIEW,
      sharedBy: tobias.id
    }
  })

  console.log('✅ 1 Sample share created (mainSample shared to microBio)')

  // ─── Pending invite ──────────────────────────────────────────────────────────

  await prisma.groupInvite.create({
    data: {
      groupId: genomicsLab.id,
      invitedUserId: jonas.id,
      invitedBy: tobias.id,
      role: GroupRole.MANAGER,
      status: 'PENDING'
    }
  })

  // ─── Audit log ───────────────────────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: mainSample.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { name: 'RNA-seq Extract #42' }
      },
      {
        entityType: AuditEntityType.TUBE,
        entityId: tube3.id,
        performedBy: lucas.id,
        action: AuditAction.HANDLE,
        changes: { status: 'checked_out' }
      }
    ]
  })

  console.log('✅ Audit logs created')
  console.log('')
  console.log('✨ Seed complete! Credentials for login:')
  console.log('   admin@example.com  (password: any)  → admin, no group membership needed')
  console.log('   tobias@example.com (password: any)  → LEADER  in Genomics Lab')
  console.log('   lucas@example.com  (password: any)  → MANAGER in Genomics Lab')
  console.log('   jonas@example.com  (password: any)  → RESEARCHER in Genomics Lab')
  console.log('')
  console.log('   Main test sample: "RNA-seq Extract #42" in Genomics Lab')
  console.log('   Tube statuses: in_storage (×4), checked_out (×1, by lucas), unplaced (×1)')
  console.log('   Attribute types: number, string, date, boolean — roles: RESEARCHER, MANAGER, LEADER')
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
