import { apiClient } from './api-client'

export interface User {
  id: string
  name: string
  email: string
}

export function getAllUsers() {
  console.log('dfasdfasd')
  return apiClient.get('auth/users').json<User[]>()
}
