export type GetSamplesFilter =
  | { search?: string; types?: string[]; page?: number; pageSize?: number }
  | undefined
