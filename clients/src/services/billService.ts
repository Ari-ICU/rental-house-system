/**
 * services/billService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All CRUD operations for the /api/bills endpoint.
 * Each function returns the unwrapped `data` field from the API envelope.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { api } from '@/lib/api';
import { Bill } from '@/types/bill';

const BASE = '/api/bills';

export type BillPayload = {
    rentalId: number;
    month: string;
    electricityAmount: number;
    waterAmount: number;
    electricityStatus: 'Paid' | 'Unpaid';
    waterStatus: 'Paid' | 'Unpaid';
    notes?: string;
};

// ── GET all bills ──────────────────────────────────────────────────────────
export async function getAllBills(): Promise<Bill[]> {
    const res = await api.get<Bill[]>(BASE);
    return res.data ?? [];
}

// ── GET single bill ────────────────────────────────────────────────────────
export async function getBillById(id: number | string): Promise<Bill> {
    const res = await api.get<Bill>(`${BASE}/${id}`);
    if (!res.data) throw new Error('Bill not found');
    return res.data;
}

// ── POST create bill ────────────────────────────────────────────────────────
export async function createBill(payload: BillPayload): Promise<Bill> {
    const res = await api.post<Bill>(BASE, payload);
    if (!res.data) throw new Error('Failed to create bill');
    return res.data;
}

// ── PUT update bill ─────────────────────────────────────────────────────────
export async function updateBill(
    id: number | string,
    payload: Partial<BillPayload>
): Promise<Bill> {
    const res = await api.put<Bill>(`${BASE}/${id}`, payload);
    if (!res.data) throw new Error('Failed to update bill');
    return res.data;
}

// ── DELETE bill ─────────────────────────────────────────────────────────────
export async function deleteBill(id: number | string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}
