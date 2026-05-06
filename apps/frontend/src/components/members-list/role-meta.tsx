import type { Role } from '@/lib/api/types/role'
import { Crown, FlaskConical, Shield } from 'lucide-react'
import type { ElementType } from 'react'

export interface RoleMeta {
  label: string
  icon: ElementType
  className: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
  LEADER: { label: 'Leader', icon: Crown, className: 'text-amber-500' },
  MANAGER: { label: 'Manager', icon: Shield, className: 'text-blue-500' },
  RESEARCHER: { label: 'Researcher', icon: FlaskConical, className: 'text-muted-foreground' }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, icon: Icon, className } = ROLE_META[role]
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className='h-3 w-3' />
      {label}
    </span>
  )
}
