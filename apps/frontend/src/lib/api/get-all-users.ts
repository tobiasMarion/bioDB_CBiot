import { apiClient } from './api-client'

export interface User {
  id: string
  name: string
  email: string
}

export function getAllUsers() {
  return apiClient.get('users/').json<User[]>()
}
