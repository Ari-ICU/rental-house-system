import { api } from '@/lib/api';
import { Room } from '@/types/room';

const BASE = '/api/rooms';

export async function getAllRooms(): Promise<Room[]> {
    const res = await api.get<Room[]>(BASE);
    return res.data ?? [];
}

export async function getRoomById(id: number | string): Promise<Room> {
    const res = await api.get<Room>(`${BASE}/${id}`);
    if (!res.data) throw new Error('Room not found');
    return res.data;
}

export async function createRoom(payload: Partial<Room>): Promise<Room> {
    const res = await api.post<Room>(BASE, payload);
    if (!res.data) throw new Error('Failed to create room');
    return res.data;
}

export async function updateRoom(id: number | string, payload: Partial<Room>): Promise<Room> {
    const res = await api.put<Room>(`${BASE}/${id}`, payload);
    if (!res.data) throw new Error('Failed to update room');
    return res.data;
}

export async function deleteRoom(id: number | string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}
