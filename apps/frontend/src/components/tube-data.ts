import type { Role } from '@/lib/api/types/role'

export type { Role }

export interface TubeAttribute {
  id: string
  key: string
  label: string
  value: string
  type: 'string' | 'number' | 'date' | 'boolean'
  minRequiredRoleToEdit: Role
}

export interface TubeBox {
  id: string
  label: string
  freezer: {
    id: string
    name: string
    locationDescription: string
  }
}

export interface Tube {
  id: string
  sampleId: string
  expirationDate: string | null
  boxId: string | null
  row: number | null
  column: number | null
  box: TubeBox | null
  attributes: TubeAttribute[]
}

export function rowToLetter(row: number): string {
  return String.fromCharCode(64 + row)
}

export function positionLabel(row: number | null, col: number | null): string | null {
  if (row === null || col === null) return null
  return `${rowToLetter(row)}${col}`
}

export function daysUntilExpiration(expirationDate: string | null): number | null {
  if (!expirationDate) return null
  const diff = new Date(expirationDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export type ExpirationStatus = 'expired' | 'critical' | 'warning' | 'ok' | 'unknown'

export function expirationStatus(expirationDate: string | null): ExpirationStatus {
  const days = daysUntilExpiration(expirationDate)
  if (days === null) return 'unknown'
  if (days < 0) return 'expired'
  if (days <= 14) return 'critical'
  if (days <= 60) return 'warning'
  return 'ok'
}

export const EXPIRATION_CONFIG: Record<
  ExpirationStatus,
  { label: string; textColor: string; dotColor: string }
> = {
  expired: {
    label: 'Expired',
    textColor: 'text-red-600 dark:text-red-400',
    dotColor: 'bg-red-500'
  },
  critical: {
    label: 'Expiring soon',
    textColor: 'text-orange-600 dark:text-orange-400',
    dotColor: 'bg-orange-500'
  },
  warning: {
    label: 'Expires soon',
    textColor: 'text-amber-600 dark:text-amber-500',
    dotColor: 'bg-amber-400'
  },
  ok: { label: 'Valid', textColor: 'text-muted-foreground', dotColor: 'bg-emerald-500' },
  unknown: {
    label: 'No expiration',
    textColor: 'text-muted-foreground/60',
    dotColor: 'bg-muted-foreground/30'
  }
}

export interface TrayCell {
  row: number
  col: number
  tubeId?: string
  isCurrentSample: boolean
  isOtherSample: boolean
}

export function buildTrayMatrix(
  tubes: Tube[],
  rows: number,
  cols: number,
  otherCells: Array<{ row: number; col: number }> = []
): TrayCell[] {
  const tubeMap = new Map(tubes.map(t => [`${t.row}-${t.column}`, t]))
  const otherSet = new Set(otherCells.map(c => `${c.row}-${c.col}`))
  const cells: TrayCell[] = []

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`
      const tube = tubeMap.get(key)
      cells.push({
        row: r,
        col: c,
        tubeId: tube?.id,
        isCurrentSample: !!tube,
        isOtherSample: !tube && otherSet.has(key)
      })
    }
  }

  return cells
}

function attr(
  key: string,
  label: string,
  value: string,
  type: TubeAttribute['type'],
  minRole: Role
): Omit<TubeAttribute, 'id'> {
  return { key, label, value, type, minRequiredRoleToEdit: minRole }
}

const MOCK_BOX: TubeBox = {
  id: 'box-001',
  label: 'BOX-2024-0038',
  freezer: {
    id: 'freezer-001',
    name: 'Haier Biomedical DW-86L',
    locationDescription: 'Prédio A, 3º andar, sala 304'
  }
}

function makeTube(
  id: string,
  row: number,
  col: number,
  exp: string,
  attrs: Omit<TubeAttribute, 'id'>[]
): Tube {
  return {
    id,
    sampleId: 'sample-mock',
    expirationDate: exp,
    boxId: MOCK_BOX.id,
    row,
    column: col,
    box: MOCK_BOX,
    attributes: attrs.map((a, i) => ({ ...a, id: `${id}-attr-${i}` }))
  }
}

// TODO: remove when GET /samples/:id/tubes endpoint is available
export const MOCK_TUBES: Tube[] = [
  makeTube('tube-1', 1, 1, '2026-08-14T00:00:00Z', [
    attr('notes', 'Observations', '', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '250', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '1.024', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '0', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Ana Souza', 'string', 'LEADER')
  ]),
  makeTube('tube-2', 1, 2, '2026-08-14T00:00:00Z', [
    attr('notes', 'Observations', 'Slightly turbid — monitor on next use', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '240', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '0.998', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '1', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Ana Souza', 'string', 'LEADER')
  ]),
  makeTube('tube-3', 2, 1, '2026-08-15T00:00:00Z', [
    attr('notes', 'Observations', '', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '180', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '1.102', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '0', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Ana Souza', 'string', 'LEADER')
  ]),
  makeTube('tube-4', 2, 2, '2026-05-20T00:00:00Z', [
    attr('notes', 'Observations', 'Used for PCR on 2024-09-01', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '50', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '0.741', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '3', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Carlos Lima', 'string', 'LEADER')
  ]),
  makeTube('tube-5', 3, 3, '2025-12-01T00:00:00Z', [
    attr('notes', 'Observations', 'Reserved for sequencing batch 12', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '250', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '1.055', 'number', 'RESEARCHER'),
    attr('batch_code', 'Batch Code', 'SEQ-BATCH-12', 'string', 'LEADER'),
    attr('freeze_cycles', 'Freeze Cycles', '0', 'number', 'LEADER')
  ]),
  makeTube('tube-6', 3, 4, '2026-08-16T00:00:00Z', [
    attr('notes', 'Observations', '', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '230', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '1.010', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '1', 'number', 'LEADER')
  ]),
  makeTube('tube-7', 4, 5, '2026-11-22T00:00:00Z', [
    attr('notes', 'Observations', '', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '215', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '0.965', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '2', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Ana Souza', 'string', 'LEADER')
  ]),
  makeTube('tube-8', 4, 6, '2024-03-01T00:00:00Z', [
    attr('notes', 'Observations', 'Expired — quarantined 2024-03-05', 'string', 'RESEARCHER'),
    attr('volume_ul', 'Volume (µL)', '250', 'number', 'RESEARCHER'),
    attr('concentration', 'Concentration (ng/µL)', '1.088', 'number', 'RESEARCHER'),
    attr('freeze_cycles', 'Freeze Cycles', '4', 'number', 'LEADER'),
    attr('authorized_by', 'Authorized By', 'Dr. Carlos Lima', 'string', 'LEADER')
  ])
]

// TODO: remove when box occupancy is returned by the API
export const MOCK_OTHER_CELLS: Array<{ row: number; col: number }> = [
  { row: 1, col: 4 },
  { row: 1, col: 6 },
  { row: 2, col: 4 },
  { row: 2, col: 7 },
  { row: 3, col: 1 },
  { row: 3, col: 7 },
  { row: 4, col: 3 },
  { row: 5, col: 2 },
  { row: 5, col: 5 },
  { row: 6, col: 1 },
  { row: 6, col: 8 },
  { row: 7, col: 4 },
  { row: 8, col: 2 },
  { row: 8, col: 9 }
]
