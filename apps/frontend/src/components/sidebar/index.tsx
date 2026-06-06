import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { ClipboardList, FlaskConical, ShieldCheck, Snowflake, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { getGroupMembers } from '@/lib/api/get-group-members'
import { getGroups } from '@/lib/api/get-groups'
import { authStore } from '@/lib/auth/store'
import { GroupSwitcher } from './group-switcher'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const user = authStore.getUser()
  const { groupId } = useParams({ strict: false })

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups
  })

  const isAdmin = user?.isAdmin ?? false
  const hasGroups = groups.length > 0
  // Em rotas admin, groupId não está na URL — usa o último grupo acessado como fallback
  const activeGroupId = groupId || localStorage.getItem('lastAccessedGroup') || groups[0]?.id

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', activeGroupId],
    queryFn: () => getGroupMembers(activeGroupId!),
    enabled: !!activeGroupId && !isAdmin  // admin não precisa verificar o cargo
  })

  // Admin sempre pode ver; não-admin precisa ser LEADER no grupo
  const canViewGroupAudit =
    isAdmin || members.some(m => m.userId === user?.id && m.role === 'LEADER' && !m.isArchived)

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <GroupSwitcher teams={groups} isAdmin={isAdmin} />
      </SidebarHeader>

      <SidebarContent>
        {hasGroups && activeGroupId && (
          <NavMain
            title='Current Group'
            items={[
              {
                title: 'Samples',
                url: `/app/${activeGroupId}/samples`,
                icon: FlaskConical,
                isActive: true,
                items: [
                  { title: 'All Samples', url: `/app/${activeGroupId}/samples` },
                  { title: 'Add New', url: `/app/${activeGroupId}/samples/new` }
                ]
              },
              { title: 'Members', url: `/app/${activeGroupId}/members`, icon: Users },
              ...(canViewGroupAudit
                ? [{ title: 'Audit Logs', url: `/app/${activeGroupId}/audit`, icon: ClipboardList }]
                : [])
            ]}
          />
        )}

        {isAdmin && (
          <NavMain
            title='Administration'
            items={[
              {
                title: 'Infrastructure',
                url: '#',
                icon: Snowflake,
                items: [
                  { title: 'Manage Freezers', url: '/app/admin/freezers' },
                  { title: 'Manage Rooms', url: '/app/admin/rooms/' }
                ]
              },
              { title: 'Admin Audit Logs', url: '/app/admin/audit', icon: ShieldCheck }
            ]}
          />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={
            user || {
              id: 'system-fallback',
              name: 'User',
              email: '',
              isAdmin: false
            }
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
