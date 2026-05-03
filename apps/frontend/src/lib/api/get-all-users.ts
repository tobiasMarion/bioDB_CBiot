import { apiClient } from './api-client'
import type { User } from './types/user'

export function getAllUsers() {
  return apiClient.get('users/').json<User[]>()
}
