import { authClient } from '@/lib/api/auth-client'
import { getMe } from '../api/me'
import { authStore } from './store' //

export const authService = {
  getUser() {
    return authStore.getUser()
  },

  async login(email: string, password: string) {
    const { token } = await authClient
      .post('auth/login', {
        json: { email, password }
      })
      .json<{ token: string }>()

    localStorage.setItem('access_token', token)

    const user = await getMe()

    authStore.setUser(user)

    return { token, user }
  },

  async me() {
    const existingUser = authStore.getUser()
    if (existingUser) {
      return existingUser
    }

    const user = await getMe()
    authStore.setUser(user)

    return user
  },

  async logout() {
    localStorage.removeItem('access_token')
    authStore.setUser(null)
  }
}
