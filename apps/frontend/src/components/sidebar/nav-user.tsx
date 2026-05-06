import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import type { User } from '@/lib/api/types/user'
import { Notifications } from './notifications'

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const initials =
    user.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U'

  const handleLogout = () => {
    navigate({ to: '/logout' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className='flex items-center gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='group/profile data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight ml-1'>
                <span className='truncate font-semibold'>{user.name}</span>

                {user.isAdmin ? (
                  <div className='relative mt-0.5 h-4 w-full overflow-hidden'>
                    <div className='absolute inset-0 flex items-center transition-transform duration-300 group-hover/profile:-translate-y-full'>
                      <span className='truncate text-xs text-muted-foreground'>Administrator</span>
                    </div>
                    <div className='absolute inset-0 flex items-center translate-y-full transition-transform duration-300 group-hover/profile:translate-y-0'>
                      <span className='block w-full truncate text-xs text-muted-foreground'>
                        {user.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                )}
              </div>
              <ChevronsUpDown className='ml-auto size-4 opacity-50' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight ml-1'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='group-data-[collapsible=icon]:hidden'>
          <Notifications />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
