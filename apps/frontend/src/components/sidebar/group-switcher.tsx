import { useNavigate, useRouterState } from '@tanstack/react-router'
import { ChevronsUpDown, Plus, ShieldAlert, Users2 } from 'lucide-react'

import { useIsMobile } from '@/hooks/use-mobile'
import type { Group } from '@/lib/api/get-groups'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'

function getInitials(name: string) {
  if (!name) return 'GP'
  return name.substring(0, 2).toUpperCase()
}

export function GroupSwitcher({ teams, isAdmin }: { teams: Group[]; isAdmin: boolean }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const state = useRouterState()
  const groupIdFromUrl = state.matches.find(m => m.params.groupId)?.params.groupId

  const activeTeam = teams.find(t => t.id === groupIdFromUrl) || teams[0]

  const handleTeamChange = (team: Group) => {
    localStorage.setItem('lastAccessedGroup', team.id)
    navigate({
      to: '/app/$groupId/samples',
      params: { groupId: team.id }
    })
  }

  if (teams.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='text-muted-foreground/60'
            tooltip={isAdmin ? 'Create your first group' : 'No groups joined'}
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-muted/50'>
              {isAdmin ? <Users2 className='size-4' /> : <ShieldAlert className='size-4' />}
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight ml-1'>
              <span className='truncate font-semibold'>
                {isAdmin ? 'No groups yet' : 'Access restricted'}
              </span>
              <span className='truncate text-xs'>
                {isAdmin ? 'Click to create one' : 'Wait for an invitation'}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const getSubtitle = (team: Group) => {
    if (team.role) {
      return team.role.charAt(0).toUpperCase() + team.role.slice(1).toLowerCase()
    }
    const count = team.amountOfMembers || 0
    return `${count} ${count === 1 ? 'member' : 'members'}`
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
                <span className='truncate text-xs text-muted-foreground'>
                  {getSubtitle(activeTeam)}
                </span>
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
                  <div className='flex flex-col flex-1'>
                    <span className='font-medium text-sm'>{team.name}</span>
                    <span className='text-xs text-muted-foreground'>{getSubtitle(team)}</span>
                  </div>
                  {index < 9 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
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
