import { apiClient } from './api-client'

export type Box = {
  id: string
  label: string
  _count: { tubes: number }
}

export type CreateBoxPayload = {
  label: string
  groupId?: string
}

export type UpdateBoxPayload = {
  label?: string
  groupId?: string
}

export function getFreezerBoxes(freezerId: string) {
  return apiClient.get(`freezers/${freezerId}/boxes`).json<Box[]>()
}

export function createBox(freezerId: string, data: CreateBoxPayload) {
  return apiClient.post(`freezers/${freezerId}/boxes`, { json: data }).json<Box>()
}

export function updateBox(id: string, data: UpdateBoxPayload) {
  return apiClient.patch(`boxes/${id}`, { json: data }).json<Box>()
}

export function archiveBox(id: string, groupId?: string) {
  const searchParams = groupId ? { groupId } : undefined
  return apiClient.delete(`boxes/${id}`, { searchParams }).json<Box>()
}
