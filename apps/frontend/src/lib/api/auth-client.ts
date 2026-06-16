import { createClient } from './http'

// Auth is served by the backend itself (mock login at `/auth/login`), so it
// shares the same relative API base as apiClient.
export const authClient = createClient(`${import.meta.env.BASE_URL}api/`, {
  disableRedirectOn401: true
})
