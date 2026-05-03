import { apiClient } from './api-client'
import type { User } from './types/user'

export async function getMe() {
  return await apiClient.get('users/me').json<User>()
}
