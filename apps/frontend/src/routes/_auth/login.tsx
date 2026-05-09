import loginImage from '@/assets/login.jpg'
import { LoginForm } from '@/components/login-form'
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

      <div className='relative hidden bg-muted lg:block'>
        <img
          src={loginImage}
          alt='Example'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  )
}
