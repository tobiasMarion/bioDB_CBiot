import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function getInitials(name: string) {
  return name.substring(0, 2).toUpperCase()
}

export function TeamSwitcher({
  teams,
  isAdmin = false
}: {
  teams: {
    id: string
    name: string
    plan: string
  }[]
  isAdmin?: boolean
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const navigate = useNavigate()

  if (!activeTeam) {
    return null
  }

  const handleTeamChange = (team: (typeof teams)[0]) => {
    setActiveTeam(team)
    navigate({ to: `/app/${team.id}` })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className='w-full'>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold'>
                  {getInitials(activeTeam.name)}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight ml-1'>
                <span className='truncate font-semibold'>{activeTeam.name}</span>
                <span className='truncate text-xs text-muted-foreground'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ml-auto opacity-50' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>
                Groups
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => handleTeamChange(team)}
                  className='gap-2 p-2 cursor-pointer'
                >
                  <Avatar className='h-6 w-6 rounded-md'>
                    <AvatarFallback className='rounded-md text-[10px] font-semibold'>
                      {getInitials(team.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-medium text-sm'>{team.name}</span>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='gap-2 p-2 cursor-pointer'>
                  <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                    <Plus className='size-4' />
                  </div>
                  <div className='font-medium text-muted-foreground'>Create group</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
