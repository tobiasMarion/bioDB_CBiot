import { Outlet, ScrollRestoration, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
