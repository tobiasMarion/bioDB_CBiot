import ky, { type Options } from 'ky'

export function createClient(
  baseUrl: string,
  options?: Options & { disableRedirectOn401?: boolean }
) {
  const disableRedirect = options?.disableRedirectOn401

  const baseClient = ky.create({
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

      afterResponse: disableRedirect
        ? []
        : [
            async state => {
              const { response } = state

              if (response.status === 401) {
                localStorage.removeItem('access_token')

                if (!location.pathname.includes('/login')) {
                  window.location.href = `${import.meta.env.BASE_URL}login`
                }
              }

              return response
            }
          ]
    }
  })

  return options ? baseClient.extend(options) : baseClient
}
