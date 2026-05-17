import type { Role } from '@/lib/api/types/role'

export type { Role }
export type AttributeType = 'string' | 'number' | 'date' | 'boolean'

export interface Attribute {
  key: string
  label: string
  value: string | number | boolean | null
  type: AttributeType
  minRole: Role
}

export const ROLE_ORDER: Record<Role, number> = {
  RESEARCHER: 1,
  MANAGER: 2,
  LEADER: 3
}

export const ROLE_LABELS: Record<Role, string> = {
  RESEARCHER: 'Researcher',
  MANAGER: 'Manager',
  LEADER: 'Leader'
}

export function canEditAttribute(userRole: Role, minRole: Role): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[minRole]
}
