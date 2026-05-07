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

  if (!user) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href }
    })
  }

  // const { groupId } = useParams({ strict: false })

  // const { data: group } = useQuery({
  //   queryKey: ['group', groupId],
  //   queryFn: () => getGroupById(groupId!),
  //   enabled: !!groupId
  // })

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <header className='mb-4 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
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

                  {/* {group && (
                    <>
                      <BreadcrumbSeparator />

                      <BreadcrumbItem>
                        <BreadcrumbPage>{group.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )} */}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className='flex items-center'>
              <ToogleDarkMode />
            </div>
          </header>

          <main className='flex flex-1 flex-col gap-4 p-4 pt-0'>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
