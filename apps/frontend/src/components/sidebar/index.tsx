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
  const activeGroupId = groupId ?? localStorage.getItem('lastAccessedGroup') ?? undefined

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
              { title: 'Audit Logs', url: `/app/${activeGroupId}/audit`, icon: ClipboardList }
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
                  { title: 'Position Map', url: '/app/admin/map' }
                ]
              },
              { title: 'Audit Logs', url: '/app/admin/audit', icon: ShieldCheck }
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
