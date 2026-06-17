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

// ── Date helpers (storage/expiration semantics are relative to "today") ──────────
const now = new Date()
const addDays = (base: Date, n: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}
const daysFromNow = (n: number) => addDays(now, n)
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

async function main() {
  console.log('🌱 Starting seed...')

  // Safety guard. This seed is destructive: it wipes every table below before
  // recreating the data. To keep deploys from nuking a populated database, it only
  // runs automatically when the database is empty (first boot). Wiping and
  // reseeding a populated database requires the explicit `--force` flag, which a
  // developer passes at invocation time (`npm run db:seed`) — never an ambient/
  // persistent env var, so it can't be left enabled on the server by accident.
  const force = process.argv.includes('--force')
  const existingUsers = await prisma.user.count()

  if (existingUsers > 0 && !force) {
    console.log(
      `⏭️  Database already has ${existingUsers} user(s) — skipping seed.\n   Run \`npm run db:seed\` (passes --force) to wipe and reseed on purpose.`
    )
    return
  }

  if (existingUsers > 0) {
    console.log(`⚠️  --force enabled: wiping ${existingUsers} existing user(s) and reseeding...`)
  }

  await prisma.auditLog.deleteMany({})
  await prisma.tubeAttribute.deleteMany({})
  await prisma.tubeEvent.deleteMany({})
  await prisma.tubeExpirationNotificationRecipient.deleteMany({})
  await prisma.tubeExpirationNotification.deleteMany({})
  await prisma.sampleShareRequest.deleteMany({})
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

  // ─── Groups (research labs at the Biotechnology Center) ──────────────────────

  const genomica = await prisma.group.create({
    data: { name: 'Laboratório de Genômica e Bioinformática', createdBy: admin.id }
  })

  const microbio = await prisma.group.create({
    data: { name: 'Laboratório de Microbiologia Molecular', createdBy: admin.id }
  })

  const biotecVegetal = await prisma.group.create({
    data: { name: 'Laboratório de Biotecnologia Vegetal', createdBy: admin.id }
  })

  // Memberships span multiple groups per user (realistic for shared researchers).
  //   Genômica       → tobias = LEADER,  felipe = MANAGER, joão = RESEARCHER
  //   Microbiologia  → rafael = LEADER,  pietro = MANAGER, joão = RESEARCHER (cross-group)
  //   Biotec Vegetal → felipe = LEADER,  tobias = RESEARCHER, pietro = RESEARCHER (cross-group)
  // jonas (Jonas Martelo) is intentionally NOT a member yet — he only has a pending invite below.
  // Created individually (instead of createMany) so we can capture their IDs for audit logs below.
  const membershipTobiasGenomica = await prisma.groupMembership.create({
    data: { userId: tobias.id, groupId: genomica.id, role: GroupRole.LEADER }
  })
  const membershipFelipeGenomica = await prisma.groupMembership.create({
    data: { userId: felipe.id, groupId: genomica.id, role: GroupRole.MANAGER }
  })
  const membershipJoaoGenomica = await prisma.groupMembership.create({
    data: { userId: joao.id, groupId: genomica.id, role: GroupRole.RESEARCHER }
  })
  const membershipRafaelMicrobio = await prisma.groupMembership.create({
    data: { userId: rafael.id, groupId: microbio.id, role: GroupRole.LEADER }
  })
  const membershipPietroMicrobio = await prisma.groupMembership.create({
    data: { userId: pietro.id, groupId: microbio.id, role: GroupRole.MANAGER }
  })
  const membershipJoaoMicrobio = await prisma.groupMembership.create({
    data: { userId: joao.id, groupId: microbio.id, role: GroupRole.RESEARCHER }
  })
  const membershipFelipeBiotec = await prisma.groupMembership.create({
    data: { userId: felipe.id, groupId: biotecVegetal.id, role: GroupRole.LEADER }
  })
  const membershipTobiasBiotec = await prisma.groupMembership.create({
    data: { userId: tobias.id, groupId: biotecVegetal.id, role: GroupRole.RESEARCHER }
  })
  await prisma.groupMembership.create({
    data: { userId: pietro.id, groupId: biotecVegetal.id, role: GroupRole.RESEARCHER }
  })

  console.log('✅ 3 Groups + memberships created')

  // ─── Rooms (Biotechnology Center building) ───────────────────────────────────

  const roomCriogenia = await prisma.room.create({
    data: {
      number: '104',
      building: 'Prédio 43421 — Centro de Biotecnologia',
      floor: 1,
      createdBy: admin.id
    }
  })

  const roomGenomica = await prisma.room.create({
    data: {
      number: '212',
      building: 'Prédio 43421 — Centro de Biotecnologia',
      floor: 2,
      createdBy: admin.id
    }
  })

  const roomVegetal = await prisma.room.create({
    data: {
      number: '08',
      building: 'Prédio 43425 — Anexo Biotecnologia Vegetal',
      floor: 0,
      createdBy: admin.id
    }
  })

  console.log('✅ 3 Rooms created')

  // ─── Freezers (real ultra-low-temperature models) & boxes ────────────────────
  // Box labels use the real, human-written names a lab actually marks on a cryobox
  // (project / organism / collection), never opaque "BOX-XXXX" codes.

  const ultrafreezerGenomica = await prisma.freezer.create({
    data: {
      name: 'Thermo Scientific TSX -86 °C (Ultrafreezer)',
      roomId: roomCriogenia.id,
      createdBy: admin.id
    }
  })
  const cryoCube = await prisma.freezer.create({
    data: {
      name: 'Eppendorf CryoCube F740 -86 °C',
      roomId: roomGenomica.id,
      createdBy: admin.id
    }
  })
  const haier = await prisma.freezer.create({
    data: {
      name: 'Haier Biomedical DW-86L388 -86 °C',
      roomId: roomCriogenia.id,
      createdBy: admin.id
    }
  })
  const freezerVegetal = await prisma.freezer.create({
    data: {
      name: 'Indrel Scientific IVB-360D -20 °C',
      roomId: roomVegetal.id,
      createdBy: admin.id
    }
  })

  // box1 is the "hero" box: it holds the main sample (and a sibling sample) so the
  // Return-to-Freezer occupancy grid has plenty of filled cells to render.
  const boxEsteatose = await prisma.box.create({
    data: {
      label: 'Projeto Esteatose — Camundongo C57BL/6',
      freezerId: ultrafreezerGenomica.id,
      createdBy: tobias.id
    }
  })
  const boxCoorteHcpa = await prisma.box.create({
    data: {
      label: 'Coorte HCPA — DNA Genômico Humano',
      freezerId: ultrafreezerGenomica.id,
      createdBy: felipe.id
    }
  })
  const boxBibliotecas = await prisma.box.create({
    data: {
      label: 'Bibliotecas RNA-seq — Illumina',
      freezerId: ultrafreezerGenomica.id,
      createdBy: felipe.id
    }
  })
  const boxGlicerolStocks = await prisma.box.create({
    data: {
      label: 'Glicerol Stocks — E. coli',
      freezerId: cryoCube.id,
      createdBy: rafael.id
    }
  })
  const boxPlasmideos = await prisma.box.create({
    data: {
      label: 'Coleção de Plasmídeos — pET / pUC',
      freezerId: cryoCube.id,
      createdBy: pietro.id
    }
  })
  const boxIsolados = await prisma.box.create({
    data: {
      label: 'Isolados Clínicos — uso restrito (NB-2)',
      freezerId: haier.id,
      createdBy: rafael.id
    }
  })
  const boxRnaBacteriano = await prisma.box.create({
    data: {
      label: 'RNA Bacteriano — Microbiologia',
      freezerId: haier.id,
      createdBy: pietro.id
    }
  })
  const boxVegetalDna = await prisma.box.create({
    data: {
      label: 'Biotec Vegetal — DNA e Plasmídeos',
      freezerId: freezerVegetal.id,
      createdBy: felipe.id
    }
  })
  const boxVegetalRna = await prisma.box.create({
    data: {
      label: 'Biotec Vegetal — RNA e Proteínas',
      freezerId: freezerVegetal.id,
      createdBy: tobias.id
    }
  })

  console.log('✅ 4 Freezers + 9 Boxes created (real, descriptive box labels)')

  // ─── Main test sample: covers all tube states and attribute types ─────────────

  const mainSample = await prisma.sample.create({
    data: {
      name: 'RNA Total — Fígado de Camundongo C57BL/6 (Projeto Esteatose)',
      type: 'RNA Total',
      originOrganism: 'Mus musculus',
      sourceLab: 'Laboratório de Genômica e Bioinformática',
      observations:
        'Extração com TRIzol a partir de fígado; RIN ≥ 8 confirmado no Bioanalyzer. Alíquotas para RNA-seq do projeto de esteatose hepática.',
      groupId: genomica.id,
      createdBy: tobias.id
    }
  })

  // Tube 1 — in_storage, full attribute set (all 4 types, all 3 roles)
  const tube1 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-08-14'),
      daysBeforeNotification: 30,
      notes: '',
      boxId: boxEsteatose.id,
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
        key: 'concentration_ng_ul',
        value: '1024',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      },
      {
        tubeId: tube1.id,
        key: 'a260_280',
        value: '2.04',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: tobias.id
      },
      {
        tubeId: tube1.id,
        key: 'extraction_date',
        value: '2026-05-30',
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
        key: 'freeze_thaw_cycles',
        value: '0',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.MANAGER,
        createdBy: felipe.id
      },
      {
        tubeId: tube1.id,
        key: 'responsible',
        value: 'Dra. Ana Beatriz Souza',
        type: 'string',
        minRequiredRoleToEdit: GroupRole.LEADER,
        createdBy: tobias.id
      }
    ]
  })

  // Tube 2 — expired (as of seed date), has active expiration notification seeded below
  const tube2 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2026-06-08'),
      daysBeforeNotification: 7,
      notes: 'Leve turbidez após descongelamento — monitorar no próximo uso.',
      boxId: boxEsteatose.id,
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
      notes: 'Reservado para o lote de sequenciamento 12.',
      checkedOutBy: felipe.id,
      checkedOutAt: new Date('2026-06-10T09:00:00Z')
    }
  })
  await prisma.tubeEvent.create({
    data: {
      tubeId: tube3.id,
      performedBy: felipe.id,
      fromBoxId: boxEsteatose.id,
      fromRow: 1,
      fromColumn: 3,
      notes: 'Retirado para preparo da biblioteca RNA-seq (lote 12).'
    }
  })
  await prisma.tubeAttribute.createMany({
    data: [
      {
        tubeId: tube3.id,
        key: 'library_batch',
        value: 'RNAseq-Lote-12',
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

  // Tube 4 — long expired, still in_storage (quarantined)
  const tube4 = await prisma.tube.create({
    data: {
      sampleId: mainSample.id,
      createdBy: tobias.id,
      expirationDate: new Date('2025-03-01'),
      daysBeforeNotification: 3,
      notes: 'Vencido — em quarentena desde 2025-03-05, aguardando descarte.',
      boxId: boxEsteatose.id,
      row: 2,
      column: 1
    }
  })
  await prisma.tubeAttribute.create({
    data: {
      tubeId: tube4.id,
      key: 'freeze_thaw_cycles',
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
      expirationDate: new Date('2027-02-15'),
      notes: 'Nova alíquota — ainda precisa ser armazenada no freezer.',
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
      boxId: boxEsteatose.id,
      row: 2,
      column: 2
    }
  })

  console.log('✅ Main test sample created with 6 tubes (all status variants + attribute types)')

  // ─── Sibling sample sharing box1 — fills the occupancy grid with "other" cells ─

  const siblingSample = await prisma.sample.create({
    data: {
      name: 'DNA Genômico — Camundongo C57BL/6 (Projeto Esteatose)',
      type: 'DNA Genômico',
      originOrganism: 'Mus musculus',
      sourceLab: 'Biotério Central UFRGS',
      observations:
        'gDNA extraído de cauda por método salting-out; pareado com as amostras de RNA do mesmo animal.',
      groupId: genomica.id,
      createdBy: felipe.id
    }
  })

  const siblingPositions = [
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

  for (const [r, c] of siblingPositions) {
    await prisma.tube.create({
      data: {
        sampleId: siblingSample.id,
        createdBy: felipe.id,
        expirationDate: new Date('2027-01-10'),
        boxId: boxEsteatose.id,
        row: r,
        column: c
      }
    })
  }

  console.log('✅ Sibling-sample tubes created in box1 (for occupancy grid testing)')

  // ─── Named samples used by the cross-group sharing scenarios ──────────────────

  // Microbiology plasmid — actively shared (EDIT) to Biotec Vegetal, and also
  // requested (VIEW, pending) to Genômica.
  const plasmidSample = await prisma.sample.create({
    data: {
      name: 'Plasmídeo pET-28a-Lipase',
      type: 'DNA Plasmidial',
      originOrganism: 'Escherichia coli',
      sourceLab: 'Laboratório de Microbiologia Molecular',
      observations:
        'Miniprep do clone de expressão; inserto da lipase de Burkholderia cepacia confirmado por PCR de colônia e sequenciamento.',
      groupId: microbio.id,
      createdBy: rafael.id
    }
  })
  const plasmidTube = await prisma.tube.create({
    data: {
      sampleId: plasmidSample.id,
      createdBy: pietro.id,
      expirationDate: daysFromNow(120),
      notes: 'Estoque mestre — usar apenas para retransformação.',
      boxId: boxPlasmideos.id,
      row: 1,
      column: 1
    }
  })
  await prisma.tube.create({
    data: {
      sampleId: plasmidSample.id,
      createdBy: pietro.id,
      expirationDate: daysFromNow(20),
      notes: 'Alíquota de trabalho.',
      boxId: boxPlasmideos.id,
      row: 1,
      column: 2
    }
  })
  await prisma.tubeAttribute.createMany({
    data: [
      {
        tubeId: plasmidTube.id,
        key: 'concentration_ng_ul',
        value: '320',
        type: 'number',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: pietro.id
      },
      {
        tubeId: plasmidTube.id,
        key: 'antibiotic_resistance',
        value: 'Canamicina',
        type: 'string',
        minRequiredRoleToEdit: GroupRole.RESEARCHER,
        createdBy: pietro.id
      },
      {
        tubeId: plasmidTube.id,
        key: 'insert_confirmed',
        value: 'true',
        type: 'boolean',
        minRequiredRoleToEdit: GroupRole.MANAGER,
        createdBy: pietro.id
      },
      {
        tubeId: plasmidTube.id,
        key: 'responsible',
        value: 'Prof. Rafael Klein',
        type: 'string',
        minRequiredRoleToEdit: GroupRole.LEADER,
        createdBy: rafael.id
      }
    ]
  })

  // Plant-biotech protein extract — requested (VIEW, pending) to Microbiology.
  const extractSample = await prisma.sample.create({
    data: {
      name: 'Extrato Proteico — Lipase recombinante His-tag',
      type: 'Extrato Proteico',
      originOrganism: 'Escherichia coli',
      sourceLab: 'Laboratório de Biotecnologia Vegetal',
      observations:
        'Lipase purificada por IMAC (Ni-NTA) a partir do clone pET-28a; estocada em tampão Tris-HCl com 10% de glicerol.',
      groupId: biotecVegetal.id,
      createdBy: felipe.id
    }
  })
  await prisma.tube.create({
    data: {
      sampleId: extractSample.id,
      createdBy: felipe.id,
      expirationDate: daysFromNow(300),
      notes: 'Fração eluída a 250 mM de imidazol; atividade confirmada por ensaio com pNPP.',
      boxId: boxVegetalRna.id,
      row: 1,
      column: 1
    }
  })

  // Archived sample — exercises the soft-delete / "reason for archiving" views.
  await prisma.sample.create({
    data: {
      name: 'Cultura contaminada — descartada (Projeto Esteatose)',
      type: 'Cultura Bacteriana',
      originOrganism: 'Escherichia coli',
      sourceLab: 'Laboratório de Genômica e Bioinformática',
      observations: 'Placa-controle apresentou crescimento fúngico.',
      groupId: genomica.id,
      createdBy: joao.id,
      isArchived: true,
      archivedAt: daysAgo(4),
      reasonForArchiving:
        'Contaminação por fungo detectada na placa-controle; lote inteiro descartado.'
    }
  })

  console.log('✅ Named samples created (shared plasmid, requested extract, archived culture)')

  // ─── Catalog of additional samples to populate the samples list ──────────────
  // Each entry is a realistic record (organism, source lab, observations). Their
  // tubes are placed sequentially into the non-hero boxes so the freezer views
  // have content to show.

  type CatalogEntry = {
    group: { id: string }
    creator: { id: string }
    name: string
    type: string
    organism: string
    sourceLab: string
    observations: string
    tubeCount: number
  }

  const catalog: CatalogEntry[] = [
    // Genômica
    {
      group: genomica,
      creator: tobias,
      name: 'DNA Genômico — Humano (Coorte HCPA Cardiomiopatia)',
      type: 'DNA Genômico',
      organism: 'Homo sapiens',
      sourceLab: 'Hospital de Clínicas de Porto Alegre',
      observations: 'Extração em coluna QIAamp; A260/280 entre 1,8 e 2,0.',
      tubeCount: 2
    },
    {
      group: genomica,
      creator: felipe,
      name: 'cDNA — Fígado de Camundongo (Projeto Esteatose)',
      type: 'cDNA',
      organism: 'Mus musculus',
      sourceLab: 'Laboratório de Genômica e Bioinformática',
      observations: 'Síntese com SuperScript IV a partir de RNA total com RIN ≥ 8.',
      tubeCount: 2
    },
    {
      group: genomica,
      creator: felipe,
      name: 'Biblioteca RNA-seq — Illumina TruSeq (Lote 12)',
      type: 'Biblioteca de Sequenciamento',
      organism: 'Mus musculus',
      sourceLab: 'Laboratório de Genômica e Bioinformática',
      observations: 'Indexada para NovaSeq 6000; tamanho médio de fragmento ~320 pb.',
      tubeCount: 1
    },
    {
      group: genomica,
      creator: joao,
      name: 'DNA Genômico — Zebrafish (Linhagem AB)',
      type: 'DNA Genômico',
      organism: 'Danio rerio',
      sourceLab: 'Biotério de Zebrafish UFRGS',
      observations: 'Extraído de nadadeira caudal; estoque para genotipagem.',
      tubeCount: 2
    },
    {
      group: genomica,
      creator: tobias,
      name: 'RNA Total — Sangue Periférico (Coorte Sepse)',
      type: 'RNA Total',
      organism: 'Homo sapiens',
      sourceLab: 'Hospital de Clínicas de Porto Alegre',
      observations: 'Coletado em tubo PAXgene; congelado em até 2 horas após a coleta.',
      tubeCount: 1
    },
    // Microbiologia
    {
      group: microbio,
      creator: rafael,
      name: 'Glicerol Stock — E. coli DH5α (pUC19)',
      type: 'Cultura Bacteriana',
      organism: 'Escherichia coli',
      sourceLab: 'Laboratório de Microbiologia Molecular',
      observations: 'Estoque em glicerol 20%; resistência a ampicilina.',
      tubeCount: 3
    },
    {
      group: microbio,
      creator: pietro,
      name: 'Cultura — Bacillus subtilis 168',
      type: 'Cultura Bacteriana',
      organism: 'Bacillus subtilis',
      sourceLab: 'Coleção de Culturas CBiot',
      observations: 'Cepa selvagem de referência para ensaios de esporulação.',
      tubeCount: 2
    },
    {
      group: microbio,
      creator: rafael,
      name: 'DNA Genômico — Pseudomonas aeruginosa (Isolado Clínico)',
      type: 'DNA Genômico',
      organism: 'Pseudomonas aeruginosa',
      sourceLab: 'Hospital de Clínicas de Porto Alegre',
      observations: 'Isolado resistente a carbapenêmicos; manuseio em NB-2.',
      tubeCount: 1
    },
    {
      group: microbio,
      creator: joao,
      name: 'RNA Total — Mycolicibacterium smegmatis',
      type: 'RNA Total',
      organism: 'Mycolicibacterium smegmatis',
      sourceLab: 'Laboratório de Microbiologia Molecular',
      observations: 'Extração com lise mecânica (beads); tratado com DNase I.',
      tubeCount: 2
    },
    {
      group: microbio,
      creator: pietro,
      name: 'Glicerol Stock — Salmonella Typhimurium LT2',
      type: 'Cultura Bacteriana',
      organism: 'Salmonella enterica',
      sourceLab: 'Coleção de Culturas CBiot',
      observations: 'Estoque de referência; manuseio em NB-2.',
      tubeCount: 1
    },
    // Biotec Vegetal
    {
      group: biotecVegetal,
      creator: felipe,
      name: 'DNA Genômico — Arabidopsis thaliana (Col-0)',
      type: 'DNA Genômico',
      organism: 'Arabidopsis thaliana',
      sourceLab: 'Laboratório de Biotecnologia Vegetal',
      observations: 'Folhas de roseta; extração pelo método CTAB.',
      tubeCount: 2
    },
    {
      group: biotecVegetal,
      creator: tobias,
      name: 'RNA Total — Soja sob Estresse Hídrico',
      type: 'RNA Total',
      organism: 'Glycine max',
      sourceLab: 'Embrapa Trigo (parceria)',
      observations: 'Tecido foliar sob déficit hídrico; congelado em nitrogênio líquido.',
      tubeCount: 2
    },
    {
      group: biotecVegetal,
      creator: pietro,
      name: 'Cultura de Levedura — S. cerevisiae BY4741',
      type: 'Cultura de Levedura',
      organism: 'Saccharomyces cerevisiae',
      sourceLab: 'Coleção de Culturas CBiot',
      observations: 'Cepa auxotrófica his3Δ1 leu2Δ0; meio YPD.',
      tubeCount: 2
    },
    {
      group: biotecVegetal,
      creator: felipe,
      name: 'cDNA — Milho (Raiz, Resposta a Alumínio)',
      type: 'cDNA',
      organism: 'Zea mays',
      sourceLab: 'Embrapa Milho e Sorgo (parceria)',
      observations: 'Biblioteca para qPCR de genes de tolerância a alumínio.',
      tubeCount: 1
    },
    {
      group: biotecVegetal,
      creator: tobias,
      name: 'DNA Plasmidial — pCAMBIA1300 (Vetor Binário)',
      type: 'DNA Plasmidial',
      organism: 'Agrobacterium tumefaciens',
      sourceLab: 'Laboratório de Biotecnologia Vegetal',
      observations: 'Vetor para transformação vegetal; cassete de resistência a higromicina.',
      tubeCount: 2
    },
    {
      group: biotecVegetal,
      creator: pietro,
      name: 'Extrato Proteico — Rubisco (Folha de Soja)',
      type: 'Extrato Proteico',
      organism: 'Glycine max',
      sourceLab: 'Laboratório de Biotecnologia Vegetal',
      observations: 'Extrato bruto solúvel; quantificado pelo método de Bradford.',
      tubeCount: 1
    }
  ]

  // Sequential placement cursor over the non-hero boxes.
  const fillBoxes = [
    boxCoorteHcpa,
    boxBibliotecas,
    boxGlicerolStocks,
    boxIsolados,
    boxRnaBacteriano,
    boxVegetalDna,
    boxVegetalRna
  ]
  // Spread of expiration offsets (days from today): valid, expiring soon, and expired.
  const expirationOffsets = [240, 70, 18, -30, 500, 35, 120, -10, 300, 55, 9, 200]

  let cursorBox = 0
  let cursorRow = 2 // boxCoorteHcpa row 1 left free for visual variety
  let cursorCol = 1

  let sampleIdx = 0
  for (const entry of catalog) {
    const sample = await prisma.sample.create({
      data: {
        name: entry.name,
        type: entry.type,
        originOrganism: entry.organism,
        sourceLab: entry.sourceLab,
        observations: entry.observations,
        groupId: entry.group.id,
        createdBy: entry.creator.id
      }
    })

    for (let t = 0; t < entry.tubeCount; t++) {
      if (cursorBox >= fillBoxes.length) break

      await prisma.tube.create({
        data: {
          sampleId: sample.id,
          createdBy: entry.creator.id,
          expirationDate: daysFromNow(
            expirationOffsets[(sampleIdx + t) % expirationOffsets.length]
          ),
          boxId: fillBoxes[cursorBox].id,
          row: cursorRow,
          column: cursorCol
        }
      })

      cursorCol++
      if (cursorCol > 12) {
        cursorCol = 1
        cursorRow++
      }
      if (cursorRow > 8) {
        cursorRow = 1
        cursorBox++
      }
    }

    sampleIdx++
  }

  console.log(`✅ ${catalog.length} additional catalog samples created for the samples list`)

  // ─── Active sample shares ─────────────────────────────────────────────────────
  // 1) mainSample (Genômica)  → Microbiologia, VIEW
  // 2) plasmidSample (Microbiologia) → Biotec Vegetal, EDIT (cross-group edit access)

  const mainSampleShare = await prisma.sampleShare.create({
    data: {
      sampleId: mainSample.id,
      targetGroupId: microbio.id,
      permission: SamplePermission.VIEW,
      sharedBy: tobias.id
    }
  })

  const plasmidShare = await prisma.sampleShare.create({
    data: {
      sampleId: plasmidSample.id,
      targetGroupId: biotecVegetal.id,
      permission: SamplePermission.EDIT,
      sharedBy: rafael.id
    }
  })

  console.log('✅ 2 Sample shares created (mainSample→Microbiologia VIEW, plasmid→Biotec EDIT)')

  // ─── Pending share requests ───────────────────────────────────────────────────
  // A) siblingSample (Genômica) → Microbiologia, EDIT — responders: rafael, pietro
  // B) plasmidSample (Microbiologia) → Genômica,   VIEW — responders: tobias, felipe

  const requestToMicrobio = await prisma.sampleShareRequest.create({
    data: {
      sampleId: siblingSample.id,
      targetGroupId: microbio.id,
      permission: SamplePermission.EDIT,
      requestedBy: tobias.id
    }
  })

  await prisma.sampleShareRequest.create({
    data: {
      sampleId: plasmidSample.id,
      targetGroupId: genomica.id,
      permission: SamplePermission.VIEW,
      requestedBy: rafael.id
    }
  })

  console.log('✅ 2 Pending share requests created (→ Microbiologia EDIT, → Genômica VIEW)')

  // ─── Tube expiration notification ────────────────────────────────────────────
  // tube2 is expired — seed an active notification so the notification bell shows a
  // TUBE_EXPIRATION item immediately after seeding.
  // Recipients: tobias (LEADER of Genômica + tube creator) + admin (isAdmin)

  const expirationNotif = await prisma.tubeExpirationNotification.create({
    data: { tubeId: tube2.id }
  })
  await prisma.tubeExpirationNotificationRecipient.createMany({
    data: [
      { notificationId: expirationNotif.id, userId: tobias.id },
      { notificationId: expirationNotif.id, userId: admin.id }
    ]
  })

  console.log('✅ 1 Tube expiration notification created (tube2, recipients: tobias + admin)')

  // ─── Pending invite ──────────────────────────────────────────────────────────

  const jonasInvite = await prisma.groupInvite.create({
    data: {
      groupId: genomica.id,
      invitedUserId: jonas.id,
      invitedBy: tobias.id,
      role: GroupRole.MANAGER,
      status: 'PENDING'
    }
  })

  // ─── Audit logs ──────────────────────────────────────────────────────────────
  // Spread across all groups (and admin-only entities) over the last ~30 days, so the
  // audit screens can be exercised against group-scoping rules, entity-type filters,
  // action filters, user filters and date-range filters.

  await prisma.auditLog.createMany({
    data: [
      // ── Groups (visible to LEADER of each group, and to admin) ──
      {
        entityType: AuditEntityType.GROUP,
        entityId: genomica.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Laboratório de Genômica e Bioinformática' },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.GROUP,
        entityId: microbio.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Laboratório de Microbiologia Molecular' },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.GROUP,
        entityId: biotecVegetal.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Laboratório de Biotecnologia Vegetal' },
        createdAt: daysAgo(29)
      },
      {
        entityType: AuditEntityType.GROUP,
        entityId: genomica.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: {
          name: { from: 'Laboratório de Genômica', to: 'Laboratório de Genômica e Bioinformática' }
        },
        createdAt: daysAgo(18)
      },

      // ── Memberships (visible per-group; only their own group's members) ──
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipTobiasGenomica.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { userId: tobias.id, groupId: genomica.id, role: 'LEADER' },
        createdAt: daysAgo(29)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipJoaoGenomica.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { userId: joao.id, groupId: genomica.id, role: 'RESEARCHER' },
        createdAt: daysAgo(27)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipFelipeGenomica.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: { role: { from: 'RESEARCHER', to: 'MANAGER' } },
        createdAt: daysAgo(20)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipRafaelMicrobio.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { userId: rafael.id, groupId: microbio.id, role: 'LEADER' },
        createdAt: daysAgo(28)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipPietroMicrobio.id,
        performedBy: rafael.id,
        action: AuditAction.CREATE,
        changes: { userId: pietro.id, groupId: microbio.id, role: 'MANAGER' },
        createdAt: daysAgo(25)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipJoaoMicrobio.id,
        performedBy: rafael.id,
        action: AuditAction.CREATE,
        changes: { userId: joao.id, groupId: microbio.id, role: 'RESEARCHER' },
        createdAt: daysAgo(24)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipFelipeBiotec.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { userId: felipe.id, groupId: biotecVegetal.id, role: 'LEADER' },
        createdAt: daysAgo(26)
      },
      {
        entityType: AuditEntityType.MEMBERSHIP,
        entityId: membershipTobiasBiotec.id,
        performedBy: felipe.id,
        action: AuditAction.CREATE,
        changes: { userId: tobias.id, groupId: biotecVegetal.id, role: 'RESEARCHER' },
        createdAt: daysAgo(23)
      },

      // ── Invite (Genômica only) ──
      {
        entityType: AuditEntityType.INVITE,
        entityId: jonasInvite.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { invitedUserId: jonas.id, role: 'MANAGER', status: 'PENDING' },
        createdAt: daysAgo(5)
      },

      // ── Samples ──
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: mainSample.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: { name: mainSample.name, type: 'RNA Total', groupId: genomica.id },
        createdAt: daysAgo(15)
      },
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: mainSample.id,
        performedBy: tobias.id,
        action: AuditAction.UPDATE,
        changes: {
          sourceLab: {
            from: 'Biotério Central UFRGS',
            to: 'Laboratório de Genômica e Bioinformática'
          }
        },
        createdAt: daysAgo(9)
      },
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: siblingSample.id,
        performedBy: felipe.id,
        action: AuditAction.CREATE,
        changes: { name: siblingSample.name, type: 'DNA Genômico', groupId: genomica.id },
        createdAt: daysAgo(14)
      },
      {
        entityType: AuditEntityType.SAMPLE,
        entityId: plasmidSample.id,
        performedBy: rafael.id,
        action: AuditAction.CREATE,
        changes: { name: plasmidSample.name, type: 'DNA Plasmidial', groupId: microbio.id },
        createdAt: daysAgo(13)
      },

      // ── Shares (visible both to the sharing group and the receiving group) ──
      {
        entityType: AuditEntityType.SHARE,
        entityId: mainSampleShare.id,
        performedBy: tobias.id,
        action: AuditAction.SHARE,
        changes: { sampleId: mainSample.id, targetGroupId: microbio.id, permission: 'VIEW' },
        createdAt: daysAgo(7)
      },
      {
        entityType: AuditEntityType.SHARE,
        entityId: plasmidShare.id,
        performedBy: rafael.id,
        action: AuditAction.SHARE,
        changes: {
          sampleId: plasmidSample.id,
          targetGroupId: biotecVegetal.id,
          permission: 'EDIT'
        },
        createdAt: daysAgo(6)
      },
      {
        entityType: AuditEntityType.SHARE,
        entityId: requestToMicrobio.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: {
          sampleId: siblingSample.id,
          targetGroupId: microbio.id,
          permission: 'EDIT',
          status: 'PENDING'
        },
        createdAt: daysAgo(4)
      },
      {
        // NOTIFY action: performedBy is null and changes carry the recipient list.
        entityType: AuditEntityType.SHARE,
        entityId: requestToMicrobio.id,
        performedBy: null,
        action: AuditAction.NOTIFY,
        changes: {
          message: `Share request for sample "${siblingSample.name}" sent to group "Laboratório de Microbiologia Molecular"`,
          notifiedUserIds: [rafael.id, pietro.id]
        },
        createdAt: daysAgo(4)
      },

      // ── Tubes (Genômica, via mainSample) ──
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
        changes: { fromBoxId: boxEsteatose.id, fromRow: 1, fromColumn: 3, toBoxId: null },
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
        changes: {
          notes: { from: '', to: 'Vencido — em quarentena desde 2025-03-05, aguardando descarte.' }
        },
        createdAt: daysAgo(2)
      },

      // ── Admin-only entities (USER, FREEZER, ROOM, BOX) — only on /audit-logs ──
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
        changes: { name: { from: 'Jonas Marteloni', to: 'Jonas Martelo' } },
        createdAt: daysAgo(12)
      },
      {
        entityType: AuditEntityType.ROOM,
        entityId: roomCriogenia.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { number: '104', building: 'Prédio 43421 — Centro de Biotecnologia', floor: 1 },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.ROOM,
        entityId: roomGenomica.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { number: '212', building: 'Prédio 43421 — Centro de Biotecnologia', floor: 2 },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.FREEZER,
        entityId: ultrafreezerGenomica.id,
        performedBy: admin.id,
        action: AuditAction.CREATE,
        changes: { name: 'Thermo Scientific TSX -86 °C (Ultrafreezer)', roomId: roomCriogenia.id },
        createdAt: daysAgo(30)
      },
      {
        entityType: AuditEntityType.FREEZER,
        entityId: cryoCube.id,
        performedBy: admin.id,
        action: AuditAction.UPDATE,
        changes: {
          name: { from: 'Eppendorf CryoCube F540 -86 °C', to: 'Eppendorf CryoCube F740 -86 °C' }
        },
        createdAt: daysAgo(22)
      },
      {
        entityType: AuditEntityType.BOX,
        entityId: boxEsteatose.id,
        performedBy: tobias.id,
        action: AuditAction.CREATE,
        changes: {
          label: 'Projeto Esteatose — Camundongo C57BL/6',
          freezerId: ultrafreezerGenomica.id
        },
        createdAt: daysAgo(17)
      }
    ]
  })

  console.log(
    '✅ Audit logs created (spanning all 3 groups, admin-only entities, NOTIFY, and ~30 days)'
  )
  console.log('')
  console.log('✨ Seed complete! Credentials for login:')
  console.log('   admin@example.com  (password: any)  → admin, no group membership needed')
  console.log(
    '   tobias@example.com (password: any)  → LEADER (Genômica), RESEARCHER (Biotec Vegetal)'
  )
  console.log(
    '   felipe@example.com (password: any)  → MANAGER (Genômica), LEADER (Biotec Vegetal)'
  )
  console.log('   joao@example.com   (password: any)  → RESEARCHER (Genômica + Microbiologia)')
  console.log('   rafael@example.com (password: any)  → LEADER (Microbiologia)')
  console.log(
    '   pietro@example.com (password: any)  → MANAGER (Microbiologia), RESEARCHER (Biotec Vegetal)'
  )
  console.log(
    '   jonas@example.com  (password: any)  → no group yet, pending invite to Genômica (MANAGER)'
  )
  console.log('')
  console.log('   Main test sample: "RNA Total — Fígado de Camundongo C57BL/6" in Genômica')
  console.log('   Tube statuses: in_storage (×4), checked_out (×1, by felipe), unplaced (×1)')
  console.log(
    '   Attribute types: number, string, date, boolean — roles: RESEARCHER, MANAGER, LEADER'
  )
  console.log('')
  console.log('   Sharing scenarios:')
  console.log(
    '   → mainSample shared (VIEW) to Microbiologia; plasmid shared (EDIT) to Biotec Vegetal'
  )
  console.log('   → pending requests: sibling→Microbiologia (EDIT), plasmid→Genômica (VIEW)')
  console.log('')
  console.log('   Notifications seeded:')
  console.log('   → tobias/felipe see: SAMPLE_SHARE_REQUEST (plasmid → Genômica, VIEW)')
  console.log('   → rafael/pietro see: SAMPLE_SHARE_REQUEST (sibling → Microbiologia, EDIT)')
  console.log('   → tobias + admin see: TUBE_EXPIRATION (tube2)')
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
