import { apiClient } from './api-client'

export type Room = {
  id: string
  number: string
  building: string
  floor: number
  createdBy: string
  isArchived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateRoomPayload = {
  number: string
  building: string
  floor: number
}

export type UpdateRoomPayload = Partial<CreateRoomPayload>

export function getRooms() {
  return apiClient.get('rooms').json<Room[]>()
}

export function getRoom(id: string) {
  return apiClient.get(`rooms/${id}`).json<Room>()
}

export function createRoom(data: CreateRoomPayload) {
  return apiClient.post('rooms/new', { json: data }).json<Room>()
}

export function updateRoom(id: string, data: UpdateRoomPayload) {
  return apiClient.patch(`rooms/${id}`, { json: data }).json<Room>()
}

export function archiveRoom(id: string) {
  return apiClient.delete(`rooms/${id}`).json<Room>()
}
