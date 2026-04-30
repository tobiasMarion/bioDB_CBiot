export interface User {
  id: string
  externalAuthId: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: Date
  isArchived: boolean
  archivedAt: Date | null
}
