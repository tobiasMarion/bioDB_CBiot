import { authClient } from '@/lib/api/auth-client'
import { authStore } from './store'

export type User = {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export const authService = {
  getUser() {
    return authStore.getUser()
  },

  async login(email: string, password: string) {
    const data = await authClient
      .post('login', {
        json: { email, password }
      })
      .json<{ token: string; user: User }>()

    localStorage.setItem('access_token', data.token)

    return data
  },

  async me() {
    const existingUser = authStore.getUser()
    if (existingUser) {
      return existingUser
    }

    const user = await authClient.get('me').json<User>()
    authStore.setUser(user)
    return user
  },

  async logout() {
    localStorage.removeItem('access_token')
    authStore.setUser(null)
  }
}
