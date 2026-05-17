import { AppSidebar } from '@/components/sidebar'
import { ToogleDarkMode } from '@/components/toogle-dark-mode'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getGroupDetails } from '@/lib/api/get-group-details'
import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { useQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, redirect, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ location }) => {
    await bootstrapAuth()

    const user = authStore.getUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href }
      })
    }

    if (location.pathname === '/app' || location.pathname === '/app/') {
      const lastGroupId = localStorage.getItem('lastAccessedGroup')

      if (lastGroupId) {
        throw redirect({
          to: `/app/${lastGroupId}/samples`
        })
      }
    }
  },
  component: AppLayout
})

function AppLayout() {
  const user = authStore.getUser()

  const params = useParams({ strict: false })

  const groupId = typeof params.groupId === 'string' ? params.groupId : undefined

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => {
      if (!groupId) {
        throw new Error('groupId is required')
      }

      return getGroupDetails(groupId)
    },
    enabled: Boolean(groupId)
  })

  if (!user) {
    return null
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className='flex h-screen flex-col overflow-hidden'>
          <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background pr-4 backdrop-blur'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />

              <Separator orientation='vertical' className='mr-2' />

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>
                    <BreadcrumbLink>CBiot</BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator className='hidden md:block' />

                  <BreadcrumbItem>
                    <BreadcrumbLink>Biological Sample Database</BreadcrumbLink>
                  </BreadcrumbItem>

                  {group && (
                    <>
                      <BreadcrumbSeparator />

                      <BreadcrumbItem>
                        <BreadcrumbPage>{group.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className='flex items-center'>
              <ToogleDarkMode />
            </div>
          </header>

          <main className='flex-1 overflow-auto p-4'>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
