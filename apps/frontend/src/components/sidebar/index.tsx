import { authService } from '@/lib/auth/service'
import { FlaskConical, ShieldCheck, Snowflake, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { TeamSwitcher } from './group-switcher'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

const data = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      id: 'g1',
      name: 'Research Group A',
      plan: 'Research'
    },
    {
      id: 'g2',
      name: 'Central Lab',
      plan: 'Analysis'
    },
    {
      id: 'g3',
      name: 'Biology Team',
      plan: 'Studies'
    }
  ],
  groupNav: [
    {
      title: 'Samples',
      url: '#',
      icon: FlaskConical,
      isActive: true,
      items: [
        {
          title: 'All Samples',
          url: '#'
        },
        {
          title: 'Add New Sample',
          url: '#'
        },
        {
          title: 'Sequencing',
          url: '#'
        }
      ]
    },
    {
      title: 'Members',
      url: '#',
      icon: Users
    }
  ],
  adminNav: [
    {
      title: 'Freezers',
      url: '#',
      icon: Snowflake,
      items: [
        {
          title: 'Manage Freezers',
          url: '#'
        },
        {
          title: 'Position Map',
          url: '#'
        }
      ]
    },
    {
      title: 'Audit & Logs',
      url: '#',
      icon: ShieldCheck,
      items: [
        {
          title: 'Access Logs',
          url: '#'
        },
        {
          title: 'Activity History',
          url: '#'
        }
      ]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = authService.getUser()
  const isAdmin = user?.isAdmin ?? false

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: '/avatars/shadcn.jpg'
      }
    : data.user

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} isAdmin={isAdmin} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.groupNav} title='Current Group' />
        {isAdmin && <NavMain items={data.adminNav} title='Administration' />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
