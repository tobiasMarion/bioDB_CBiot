import { ChevronRight, type LucideIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

export function NavMain({
  items,
  title
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  title?: string
}) {
  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className='text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1'>
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className='gap-1'>
        {items.map(item => (
          <Collapsible key={item.title} defaultOpen={item.isActive} className='group/collapsible'>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} className='font-medium'>
                  {item.icon && <item.icon className='h-4 w-4 opacity-70' />}
                  <span>{item.title}</span>
                  {item.items && item.items.length > 0 && (
                    <ChevronRight className='ml-auto h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub className='ml-5 border-l px-2.5 py-0.5'>
                    {item.items.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton className='text-muted-foreground hover:text-foreground text-sm font-normal transition-colors'>
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
