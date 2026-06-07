import { apiClient } from './api-client'

export type Freezer = {
  id: string
  name: string
  roomId: string
  createdBy: string
  room: {
    id: string
    number: string
    building: string
    floor: number
  }
}

export type CreateFreezerPayload = {
  name: string
  roomId: string
}

export type UpdateFreezerPayload = Partial<CreateFreezerPayload>

export function getFreezers() {
  return apiClient.get('freezers').json<Freezer[]>()
}

export function createFreezer(data: CreateFreezerPayload) {
  return apiClient.post('freezers/new', { json: data }).json<Freezer>()
}

export function updateFreezer(id: string, data: UpdateFreezerPayload) {
  return apiClient.patch(`freezers/${id}`, { json: data }).json<Freezer>()
}

export function archiveFreezer(id: string) {
  return apiClient.delete(`freezers/${id}`).json<Freezer>()
}
