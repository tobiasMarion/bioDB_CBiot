import { PrismaPg } from '@prisma/adapter-pg'
import { GroupRole, InviteStatus, PrismaClient } from '../src/common/prisma/generated/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
  console.log('🌱 Start seeding...')

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

  const admin = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|admin_user',
      email: 'admin@biobank.ufrgs.br',
      name: 'Fernando Pessoa',
      isAdmin: true
    }
  })

  const leadResearcher = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|tobias_marion',
      email: 'tobias.marion@ufrgs.br',
      name: 'João Galhardo',
      isAdmin: false
    }
  })

  const guestUser = await prisma.user.create({
    data: {
      externalAuthId: 'auth0|guest_researcher',
      email: 'guest@ufrgs.br',
      name: 'Pedro Pereira'
    }
  })

  console.log('✅ Users created')

  const geneticsLab = await prisma.group.create({
    data: {
      name: 'Genetics Lab - CBIOT',
      createdBy: admin.id
    }
  })

  console.log('✅ Groups created')

  await prisma.groupMembership.create({
    data: {
      userId: leadResearcher.id,
      groupId: geneticsLab.id,
      role: GroupRole.LEADER
    }
  })

  // 5. Create Invites (Using IDs from previous steps to avoid P2003)
  await prisma.groupInvite.create({
    data: {
      groupId: geneticsLab.id,
      invitedUserId: guestUser.id,
      invitedBy: leadResearcher.id,
      role: GroupRole.RESEARCHER,
      status: InviteStatus.PENDING
    }
  })

  console.log('✅ Group invites and memberships created')

  const ultraLowFreezer = await prisma.freezer.create({
    data: {
      name: 'Ultra-Low Freezer 01',
      locationDescription: 'Room 102 - Cold Storage Wing',
      createdBy: admin.id
    }
  })

  const boxA1 = await prisma.box.create({
    data: {
      label: 'GEN-BOX-A1',
      freezerId: ultraLowFreezer.id,
      createdBy: leadResearcher.id
    }
  })

  console.log('✅ Storage hierarchy (Freezer/Box) established')

  const sampleA = await prisma.sample.create({
    data: {
      name: 'DNA Extract - Sample 404',
      type: 'Genomic DNA',
      originOrganism: 'Homo sapiens',
      sourceLab: 'HCPA External',
      groupId: geneticsLab.id,
      createdBy: leadResearcher.id
    }
  })

  await prisma.tube.create({
    data: {
      sampleId: sampleA.id,
      createdBy: leadResearcher.id,
      expirationDate: new Date('2030-01-01'),
      boxId: boxA1.id,
      row: 1,
      column: 1
    }
  })

  console.log('✅ Samples and Tubes linked successfully')
  console.log('✨ Seeding process finished.')
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
