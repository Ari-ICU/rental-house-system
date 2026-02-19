/**
 * lib/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetch wrapper that always uses RELATIVE paths (/api/...).
 *
 * Why relative?
 *   In Docker, the browser cannot reach the Express container by hostname.
 *   Instead the browser calls Next.js (same origin) and next.config.ts
 *   rewrites /api/* → http://server:4000/api/* on the server side.
 *
 *   Browser  →  localhost:3000/api/rentals   (same-origin, no CORS)
 *   Next.js  →  server:4000/api/rentals      (internal Docker network)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Error shape ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors: string[] | null = null
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ── Envelope type (matches server/utils/apiResponse.js) ──────────────────────
export interface ApiEnvelope<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
    errors: string[] | null;
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
}

// ── Core request helper ───────────────────────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
    // Always use a relative URL — Next.js rewrites handle the proxy
    const url = path.startsWith('/') ? path : `/${path}`;

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
        ...options,
    });

    let body: ApiEnvelope<T>;
    try {
        body = await res.json();
    } catch {
        throw new ApiError(res.status, `Non-JSON response from ${url}`);
    }

    if (!res.ok || !body.success) {
        throw new ApiError(
            res.status,
            body.message ?? 'An unexpected error occurred',
            body.errors
        );
    }

    return body;
}

// ── Public helpers ────────────────────────────────────────────────────────────
export const api = {
    get: <T>(path: string, init?: RequestInit) =>
        request<T>(path, { method: 'GET', cache: 'no-store', ...init }),

    post: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
            ...init,
        }),

    put: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...init,
        }),

    delete: <T>(path: string, init?: RequestInit) =>
        request<T>(path, { method: 'DELETE', ...init }),
};
