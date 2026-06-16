import { apiClient } from './api-client'

export type Box = {
  id: string
  label: string
  amountOfTubes: number
}

export type CreateBoxPayload = {
  label: string
}

export type UpdateBoxPayload = {
  label?: string
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

export function archiveBox(id: string) {
  return apiClient.delete(`boxes/${id}`)
}
