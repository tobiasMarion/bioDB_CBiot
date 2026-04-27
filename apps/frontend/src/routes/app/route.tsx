import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ location }) => {
    await bootstrapAuth()

    const user = authStore.getUser()
    console.log(user)

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href }
      })
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
    <main className='flex-1 p-6 flex flex-col gap-16'>
      <div>
        This is the app layout
        <h1>Hello, {user.name}</h1>
        <span>{user.email}</span>
        <Link to='/logout' className='block border border-red-500 p-8 w-fit'>
          Logout
        </Link>
      </div>
      <Outlet />
    </main>
  )
}
