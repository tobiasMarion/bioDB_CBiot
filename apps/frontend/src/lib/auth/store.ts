import type { User } from './service'

let user: User | null = null
let initialized = false

export const authStore = {
  getUser: () => user,
  setUser: (u: User | null) => {
    user = u
  },

  isInitialized: () => initialized,
  setInitialized: (v: boolean) => {
    initialized = v
  }
}
