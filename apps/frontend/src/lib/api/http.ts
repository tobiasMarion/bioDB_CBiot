import ky, { type Options } from 'ky'

export function createClient(baseUrl: string, options?: Options) {
  return ky.create({
    baseUrl: baseUrl,

    hooks: {
      beforeRequest: [
        state => {
          const token = localStorage.getItem('access_token')

          if (token) {
            state.request.headers.set('Authorization', `Bearer ${token}`)
          }
        }
      ],

      afterResponse: [
        async state => {
          const { response } = state

          if (response.status === 401) {
            localStorage.removeItem('access_token')

            if (!location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }

          return response
        }
      ]
    },

    ...options
  })
}
