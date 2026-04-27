import { createClient } from './http'

export const authClient = createClient(import.meta.env.VITE_AUTH_URL, {
  hooks: {
    afterResponse: [
      async state => {
        return state.response
      }
    ]
  }
})
