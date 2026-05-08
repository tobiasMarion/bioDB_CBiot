import { authService } from './service'
import { authStore } from './store'

let bootstrapPromise: Promise<void> | null = null

export async function bootstrapAuth() {
  if (authStore.isInitialized()) return
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    try {
      const user = await authService.me()
      authStore.setUser(user)
    } catch {
      authStore.setUser(null)
    } finally {
      authStore.setInitialized(true)
      bootstrapPromise = null
    }
  })()

  return bootstrapPromise
}
