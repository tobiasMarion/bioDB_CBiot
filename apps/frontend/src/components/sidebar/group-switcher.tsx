import { useIsMobile } from '@/hooks/use-mobile'
import type { Group } from '@/lib/api/get-groups'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { ChevronsUpDown, Plus, ShieldAlert, Users2 } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import { CreateGroupDialog } from './create-group-dialog'

function getInitials(name: string) {
  if (!name) return 'GP'
  return name.substring(0, 2).toUpperCase()
}

export function GroupSwitcher({ teams, isAdmin }: { teams: Group[]; isAdmin: boolean }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const state = useRouterState()
  const groupIdFromUrl = state.matches.find(m => m.params.groupId)?.params.groupId

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const activeTeam = teams.find(t => t.id === groupIdFromUrl) || teams[0]

  const handleTeamChange = (team: Group) => {
    localStorage.setItem('lastAccessedGroup', team.id)
    navigate({
      to: '/app/$groupId/samples',
      params: { groupId: team.id }
    })
  }

  const getSubtitle = (team: Group) => {
    if (team.role) {
      return team.role.charAt(0).toUpperCase() + team.role.slice(1).toLowerCase()
    }
    const count = team.amountOfMembers || 0
    return `${count} ${count === 1 ? 'membro' : 'membros'}`
  }

  if (teams.length === 0) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='text-muted-foreground/60'
              tooltip={isAdmin ? 'Criar seu primeiro grupo' : 'Nenhum grupo disponível'}
              onClick={isAdmin ? () => setIsCreateDialogOpen(true) : undefined}
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-muted/50'>
                {isAdmin ? <Users2 className='size-4' /> : <ShieldAlert className='size-4' />}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight ml-1'>
                <span className='truncate font-semibold'>
                  {isAdmin ? 'Nenhum grupo ainda' : 'Acesso restrito'}
                </span>
                <span className='truncate text-xs'>
                  {isAdmin ? 'Clique para criar um' : 'Aguarde um convite'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <CreateGroupDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      </>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg bg-linear-to-br from-gradient-start to-gradient-end  text-sidebar-primary-foreground text-xs font-semibold'>
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
                  Grupos
                </DropdownMenuLabel>
                {teams.map(team => (
                  <DropdownMenuItem
                    key={team.id}
                    onClick={() => handleTeamChange(team)}
                    className='gap-2 p-2 cursor-pointer'
                  >
                    <Avatar size='sm'>
                      <AvatarFallback className='rounded-lg bg-linear-to-br from-gradient-start to-gradient-end text-sidebar-primary-foreground text-xs font-semibold'>
                        {getInitials(team.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col flex-1'>
                      <span className='font-medium text-sm'>{team.name}</span>
                      <span className='text-xs text-muted-foreground'>{getSubtitle(team)}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='gap-2 p-2 cursor-pointer'
                    onSelect={() => setIsCreateDialogOpen(true)}
                  >
                    <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                      <Plus className='size-4' />
                    </div>
                    <div className='font-medium text-muted-foreground'>Criar grupo</div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateGroupDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  )
}
