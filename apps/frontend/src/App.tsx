import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from './components/theme-provider'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

export function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
