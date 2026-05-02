import { apiClient } from './api-client'

export type User = {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export async function getMe() {
  return await apiClient.get('users/me').json<User>()
}
