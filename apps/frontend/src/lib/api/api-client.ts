import { createClient } from './http'

// Relative base served through the reverse proxy: `/api/` in local dev (Vite
// proxy) and `/<base-path>/api/` in deploy (Nginx). The trailing slash is
// required so page-relative inputs like `groups` extend the full path.
export const apiClient = createClient(`${import.meta.env.BASE_URL}api/`)
