import { createClient } from './http'

export const authClient = createClient(import.meta.env.VITE_AUTH_URL, {
  disableRedirectOn401: true
})
