import { createClient } from './http'

export const apiClient = createClient(import.meta.env.VITE_API_URL)
