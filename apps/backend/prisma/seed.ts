import { PrismaPg } from '@prisma/adapter-pg'
import {
  AuditAction,
  AuditEntityType,
  GroupRole,
  InviteStatus,
  PrismaClient,
  SamplePermission
} from '../src/common/prisma/generated/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
  // ──────────────────────────────────────────────
  // EXAMPLE
  // ──────────────────────────────────────────────
  const examples = [
    { name: 'Alice', email: 'alice@email.com', age: 25, description: 'Pesquisadora sênior' },
    { name: 'Bob', email: 'bob@email.com', age: 30, description: null },
    { name: 'Carol', email: 'carol@email.com', age: 28, description: 'Analista de dados' }
  ]
  // ──────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────
  const users = [
    {
      id: 'user-1',
      externalAuthId: 'auth-001',
      email: 'joao@lab.com',
      name: 'João Silva',
      isAdmin: true
    },
    {
      id: 'user-2',
      externalAuthId: 'auth-002',
      email: 'maria@lab.com',
      name: 'Maria Souza',
      isAdmin: false
    },
    {
      id: 'user-3',
      externalAuthId: 'auth-003',
      email: 'pedro@lab.com',
      name: 'Pedro Lima',
      isAdmin: false
    },
    {
      id: 'user-4',
      externalAuthId: 'auth-004',
      email: 'ana@lab.com',
      name: 'Ana Costa',
      isAdmin: false
    }
  ]
  // ──────────────────────────────────────────────
  // GROUPS
  // ──────────────────────────────────────────────
  const groups = [
    { id: 'group-1', name: 'Grupo de Biologia Molecular', createdBy: 'user-1' },
    { id: 'group-2', name: 'Laboratório de Genética', createdBy: 'user-2' }
  ]
  // ──────────────────────────────────────────────
  // GROUP MEMBERSHIPS
  // ──────────────────────────────────────────────
  const memberships = [
    { id: 'mem-1', userId: 'user-1', groupId: 'group-1', role: GroupRole.LEADER },
    { id: 'mem-2', userId: 'user-2', groupId: 'group-1', role: GroupRole.RESEARCHER },
    { id: 'mem-3', userId: 'user-2', groupId: 'group-2', role: GroupRole.LEADER },
    { id: 'mem-4', userId: 'user-3', groupId: 'group-2', role: GroupRole.MANAGER }
  ]
  // ──────────────────────────────────────────────
  // GROUP INVITES
  // ──────────────────────────────────────────────
  const invites = [
    {
      id: 'invite-1',
      groupId: 'group-1',
      invitedUserId: 'user-3',
      invitedBy: 'user-1',
      status: InviteStatus.PENDING
    },
    {
      id: 'invite-2',
      groupId: 'group-2',
      invitedUserId: 'user-4',
      invitedBy: 'user-2',
      status: InviteStatus.ACCEPTED
    }
  ]
  // ──────────────────────────────────────────────
  // FREEZERS
  // ──────────────────────────────────────────────
  const freezers = [
    {
      id: 'freezer-1',
      name: 'Freezer A - Sala 101',
      locationDescription: 'Corredor principal, lado esquerdo',
      createdBy: 'user-1'
    },
    {
      id: 'freezer-2',
      name: 'Freezer B - Sala 203',
      locationDescription: 'Sala de amostras, prateleira 3',
      createdBy: 'user-2'
    }
  ]
  // ──────────────────────────────────────────────
  // BOXES
  // ──────────────────────────────────────────────
  const boxes = [
    { id: 'box-1', freezerId: 'freezer-1', label: 'Box-A1', createdBy: 'user-1' },
    { id: 'box-2', freezerId: 'freezer-1', label: 'Box-A2', createdBy: 'user-1' },
    { id: 'box-3', freezerId: 'freezer-2', label: 'Box-B1', createdBy: 'user-2' }
  ]
  // ──────────────────────────────────────────────
  // SAMPLES
  // ──────────────────────────────────────────────
  const samples = [
    {
      id: 'sample-1',
      name: 'Amostra DNA-001',
      type: 'DNA',
      originOrganism: 'Homo sapiens',
      sourceLab: 'Lab Central',
      groupId: 'group-1',
      createdBy: 'user-1'
    },
    {
      id: 'sample-2',
      name: 'Amostra RNA-002',
      type: 'RNA',
      originOrganism: 'Mus musculus',
      sourceLab: 'Lab Norte',
      groupId: 'group-1',
      createdBy: 'user-2'
    },
    {
      id: 'sample-3',
      name: 'Proteína-003',
      type: 'Protein',
      originOrganism: 'Escherichia coli',
      sourceLab: 'Lab Sul',
      groupId: 'group-2',
      createdBy: 'user-2'
    }
  ]
  // ──────────────────────────────────────────────
  // TUBES
  // ──────────────────────────────────────────────
  const tubes = [
    {
      id: 'tube-1',
      sampleId: 'sample-1',
      createdBy: 'user-1',
      expirationDate: new Date('2026-12-31'),
      boxId: 'box-1',
      row: 1,
      column: 1
    },
    {
      id: 'tube-2',
      sampleId: 'sample-1',
      createdBy: 'user-1',
      expirationDate: new Date('2026-12-31'),
      boxId: 'box-1',
      row: 1,
      column: 2
    },
    {
      id: 'tube-3',
      sampleId: 'sample-2',
      createdBy: 'user-2',
      expirationDate: new Date('2025-06-30'),
      boxId: 'box-2',
      row: 2,
      column: 1
    },
    {
      id: 'tube-4',
      sampleId: 'sample-3',
      createdBy: 'user-2',
      expirationDate: new Date('2027-03-15'),
      boxId: 'box-3',
      row: 1,
      column: 1
    }
  ]
  // ──────────────────────────────────────────────
  // TUBE EVENTS
  // ──────────────────────────────────────────────
  const tubeEvents = [
    {
      id: 'event-1',
      tubeId: 'tube-1',
      performedBy: 'user-1',
      fromBoxId: null,
      toBoxId: 'box-1',
      toRow: 1,
      toColumn: 1,
      notes: 'Armazenamento inicial'
    },
    {
      id: 'event-2',
      tubeId: 'tube-3',
      performedBy: 'user-2',
      fromBoxId: 'box-1',
      toBoxId: 'box-2',
      fromRow: 1,
      fromColumn: 1,
      toRow: 2,
      toColumn: 1,
      notes: 'Transferência para análise'
    }
  ]
  // ──────────────────────────────────────────────
  // TUBE ATTRIBUTES
  // ──────────────────────────────────────────────
  const tubeAttributes = [
    { id: 'attr-1', tubeId: 'tube-1', key: 'concentracao', value: '50ng/uL', createdBy: 'user-1' },
    { id: 'attr-2', tubeId: 'tube-1', key: 'pureza', value: '1.8 A260/280', createdBy: 'user-1' },
    { id: 'attr-3', tubeId: 'tube-3', key: 'volume', value: '100uL', createdBy: 'user-2' }
  ]
  // ──────────────────────────────────────────────
  // SAMPLE SHARES
  // ──────────────────────────────────────────────
  const sampleShares = [
    {
      id: 'share-1',
      sampleId: 'sample-1',
      targetGroupId: 'group-2',
      permission: SamplePermission.VIEW,
      sharedBy: 'user-1'
    },
    {
      id: 'share-2',
      sampleId: 'sample-2',
      targetGroupId: 'group-2',
      permission: SamplePermission.EDIT,
      sharedBy: 'user-1'
    }
  ]
  // ──────────────────────────────────────────────
  // AUDIT LOGS
  // ──────────────────────────────────────────────
  const auditLogs = [
    {
      id: 'audit-1',
      entityType: AuditEntityType.SAMPLE,
      entityId: 'sample-1',
      performedBy: 'user-1',
      action: AuditAction.CREATE,
      changes: { name: 'Amostra DNA-001' }
    },
    {
      id: 'audit-2',
      entityType: AuditEntityType.TUBE,
      entityId: 'tube-1',
      performedBy: 'user-1',
      action: AuditAction.MOVE,
      changes: { toBox: 'box-1', row: 1, column: 1 }
    },
    {
      id: 'audit-3',
      entityType: AuditEntityType.SHARE,
      entityId: 'share-1',
      performedBy: 'user-1',
      action: AuditAction.SHARE,
      changes: { targetGroup: 'group-2', permission: 'VIEW' }
    }
  ]

  // ──────────────────────────────────────────────
  // INSERTING INTO THE DB (IF ID DOESN'T EXIST)
  // ──────────────────────────────────────────────
  for (const example of examples) {
    await prisma.example.upsert({
      where: { email: example.email },
      update: {},
      create: example
    })
  }
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user
    })
  }
  for (const group of groups) {
    await prisma.group.upsert({
      where: { id: group.id },
      update: {},
      create: group
    })
  }
  for (const mem of memberships) {
    await prisma.groupMembership.upsert({
      where: { id: mem.id },
      update: {},
      create: mem
    })
  }
  for (const invite of invites) {
    await prisma.groupInvite.upsert({
      where: { id: invite.id },
      update: {},
      create: invite
    })
  }
  for (const freezer of freezers) {
    await prisma.freezer.upsert({
      where: { id: freezer.id },
      update: {},
      create: freezer
    })
  }
  for (const box of boxes) {
    await prisma.box.upsert({
      where: { id: box.id },
      update: {},
      create: box
    })
  }
  for (const sample of samples) {
    await prisma.sample.upsert({
      where: { id: sample.id },
      update: {},
      create: sample
    })
  }
  for (const tube of tubes) {
    await prisma.tube.upsert({
      where: { id: tube.id },
      update: {},
      create: tube
    })
  }
  for (const event of tubeEvents) {
    await prisma.tubeEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event
    })
  }
  for (const attr of tubeAttributes) {
    await prisma.tubeAttribute.upsert({
      where: { id: attr.id },
      update: {},
      create: attr
    })
  }
  for (const share of sampleShares) {
    await prisma.sampleShare.upsert({
      where: { id: share.id },
      update: {},
      create: share
    })
  }
  for (const log of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: log
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
