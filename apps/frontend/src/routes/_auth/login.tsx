import { LoginForm } from '@/components/login-form'
import { usePageTitle } from '@/hooks/use-page-title'
import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dna } from 'lucide-react'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    await bootstrapAuth()
    if (authStore.getUser()) {
      throw redirect({ to: '/app' })
    }
  },
  component: LoginPage
})

function LoginPage() {
  usePageTitle('Login')
  const search = Route.useSearch()

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <span className='flex items-center gap-2 font-medium'>
            <div className='flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <Dna className='size-4' />
            </div>
            Bio Database ● CBiot
          </span>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <LoginForm redirect={search.redirect} />
          </div>
        </div>
      </div>

      <div className='relative hidden overflow-hidden bg-linear-to-br from-gradient-start to-gradient-end lg:flex lg:flex-col lg:items-center lg:justify-center'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(0,0,0,0.12),transparent_55%)]' />

        <div className='relative z-10 flex flex-col items-center gap-6 px-12 text-center text-white'>
          <div className='flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm'>
            <Dna className='size-9' />
          </div>
          <div className='space-y-2'>
            <h2 className='text-3xl font-semibold tracking-tight'>Bio Database</h2>
            <p className='text-base font-medium opacity-80'>Biotechnology Center — UFRGS</p>
          </div>
          <p className='max-w-xs text-sm leading-relaxed opacity-70'>
            Centralized management of biological samples, tube locations and research group access.
          </p>
        </div>

        <div className='absolute bottom-0 left-0 right-0 h-px bg-white/10' />
      </div>
    </div>
  )
}
