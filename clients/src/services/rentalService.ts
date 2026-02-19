/**
 * services/rentalService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All CRUD operations for the /api/rentals endpoint.
 * Each function returns the unwrapped `data` field from the API envelope.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { api } from '@/lib/api';
import { Rental } from '@/types/rents';

const BASE = '/api/rentals';

// ── Payload type for create / update (id is server-generated) ────────────────
export type RentalPayload = Omit<Rental, 'id' | 'clientImageCard'> & {
    clientImageCardFront?: string;
    clientImageCardBack?: string;
};

// ── GET all rentals ──────────────────────────────────────────────────────────
export async function getAllRentals(): Promise<Rental[]> {
    const res = await api.get<Rental[]>(BASE);
    return res.data ?? [];
}

// ── GET single rental ────────────────────────────────────────────────────────
export async function getRentalById(id: number | string): Promise<Rental> {
    const res = await api.get<Rental>(`${BASE}/${id}`);
    if (!res.data) throw new Error('Rental not found');
    return res.data;
}

// ── POST create rental ────────────────────────────────────────────────────────
export async function createRental(payload: RentalPayload): Promise<Rental> {
    const res = await api.post<Rental>(BASE, payload);
    if (!res.data) throw new Error('Failed to create rental');
    return res.data;
}

// ── PUT update rental ─────────────────────────────────────────────────────────
export async function updateRental(
    id: number | string,
    payload: Partial<RentalPayload>
): Promise<Rental> {
    const res = await api.put<Rental>(`${BASE}/${id}`, payload);
    if (!res.data) throw new Error('Failed to update rental');
    return res.data;
}

// ── DELETE rental ─────────────────────────────────────────────────────────────
export async function deleteRental(id: number | string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}
