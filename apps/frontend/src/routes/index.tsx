import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <div>Hello "/"!</div>
      <Link to={'/profile'}>profile</Link>
    </>
  )
}
