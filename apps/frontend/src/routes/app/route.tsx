import { AppSidebar } from '@/components/sidebar'
import { ToogleDarkMode } from '@/components/toogle-dark-mode'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b mb-4 pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              {/* Agora usando o Separator correto do Radix/Shadcn */}
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>CBiot</BreadcrumbItem>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Biological Sample Database</BreadcrumbPage>
                  </BreadcrumbItem>
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
