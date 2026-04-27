import { authService } from './service'
import { authStore } from './store'

export async function bootstrapAuth() {
  if (authStore.isInitialized()) return

  try {
    const user = await authService.me()
    authStore.setUser(user)
  } catch {
    authStore.setUser(null)
  } finally {
    authStore.setInitialized(true)
  }
}
