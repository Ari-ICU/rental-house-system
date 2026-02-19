/**
 * services/reportService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All CRUD operations for the /api/reports endpoint.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { api } from '@/lib/api';
import { Report } from '@/types/report';

const BASE = '/api/reports';

export type ReportPayload = Omit<Report, 'id' | 'generatedAt' | 'createdAt' | 'updatedAt'>;

// ── GET all reports ──────────────────────────────────────────────────────────
export async function getAllReports(): Promise<Report[]> {
    const res = await api.get<Report[]>(BASE);
    return res.data ?? [];
}

// ── GET single report ────────────────────────────────────────────────────────
export async function getReportById(id: number | string): Promise<Report> {
    const res = await api.get<Report>(`${BASE}/${id}`);
    if (!res.data) throw new Error('Report not found');
    return res.data;
}

// ── POST create report ────────────────────────────────────────────────────────
export async function createReport(payload: ReportPayload): Promise<Report> {
    const res = await api.post<Report>(BASE, payload);
    if (!res.data) throw new Error('Failed to create report');
    return res.data;
}

// ── PUT update report ─────────────────────────────────────────────────────────
export async function updateReport(
    id: number | string,
    payload: Partial<ReportPayload>
): Promise<Report> {
    const res = await api.put<Report>(`${BASE}/${id}`, payload);
    if (!res.data) throw new Error('Failed to update report');
    return res.data;
}

// ── DELETE report ─────────────────────────────────────────────────────────────
export async function deleteReport(id: number | string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}
