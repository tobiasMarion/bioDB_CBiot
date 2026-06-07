import type { Role } from '@/lib/api/types/role'

export type { Role }

export interface TubeAttribute {
  id: string
  key: string
  label?: string
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
    room: {
      id: string
      number: string
      building: string
      floor: number
    }
  }
}

export type TubeStatus = 'in_storage' | 'checked_out' | 'unplaced'

export interface CheckoutInfo {
  by: { id: string; name: string }
  at: string
}

export interface Tube {
  id: string
  sampleId: string
  expirationDate: string | null
  daysBeforeNotification: number
  notes: string
  boxId: string | null
  row: number | null
  column: number | null
  box: TubeBox | null
  status: TubeStatus
  checkedOut: CheckoutInfo | null
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
  isCheckedOut: boolean
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
        isOtherSample: !tube && otherSet.has(key),
        isCheckedOut: !!tube && tube.status === 'checked_out'
      })
    }
  }

  return cells
}
