import type { Role } from '@/lib/api/types/role'

export interface RoleMeta {
  label: string
  className: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
  LEADER: { label: 'Leader', className: 'text-amber-600 dark:text-amber-500' },
  MANAGER: { label: 'Manager', className: 'text-blue-600 dark:text-blue-500' },
  RESEARCHER: { label: 'Researcher', className: 'text-muted-foreground' }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const { label, className: textClass } = ROLE_META[role]
  return <span className={`text-xs font-medium ${textClass} ${className || ''}`}>{label}</span>
}
