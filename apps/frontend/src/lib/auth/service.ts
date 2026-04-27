import { authClient } from '@/lib/api/auth-client'
import { authStore } from './store'

export type User = {
  id: string
  email: string
  name: string
  isAdming: boolean
}

export const authService = {
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
    return authClient.get('me').json<User>()
  },

  async logout() {
    localStorage.removeItem('access_token')
    authStore.setUser(null)
  }
}
