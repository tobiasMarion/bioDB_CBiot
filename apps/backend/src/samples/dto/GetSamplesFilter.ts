export type GetSamplesFilter =
  | {
      search?: string
      types?: string[]
      page?: number
      pageSize?: number
      sortBy?: 'name' | 'type' | 'createdAt'
      sortOrder?: 'asc' | 'desc'
    }
  | undefined
