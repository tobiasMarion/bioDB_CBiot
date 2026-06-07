import { HTTPError } from 'ky'

export async function getApiErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    const data = error.data as { message?: string | string[] } | undefined
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join('. ') : data.message
    }
    const { status } = error.response
    if (status === 403) return "You don't have permission to do this"
    if (status === 404) return 'Resource not found'
    if (status === 409) return 'Conflict — this action cannot be completed'
    return `Server error (${status})`
  }
  return 'An unexpected error occurred'
}
