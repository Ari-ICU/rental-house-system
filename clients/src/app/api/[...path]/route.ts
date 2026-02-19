/**
 * app/api/[...path]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Catch-all API proxy route.
 *
 * Every request to  /api/**  is forwarded to the Express backend:
 *   Browser → localhost:3000/api/rentals
 *   Next.js → http://server:4000/api/rentals  (internal Docker network)
 *
 * API_URL is read at REQUEST TIME (not build time), so it always picks up
 * the correct Docker service hostname from the runtime environment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
    process.env.API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

// ── Shared proxy handler ──────────────────────────────────────────────────────
async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
    const targetUrl = `${BACKEND_URL}/api/${path.join('/')}${req.nextUrl.search ?? ''
        }`;

    // Forward headers (strip host to avoid conflicts)
    const forwardHeaders = new Headers(req.headers);
    forwardHeaders.delete('host');

    try {
        const backendRes = await fetch(targetUrl, {
            method: req.method,
            headers: forwardHeaders,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            // @ts-expect-error – duplex required for streaming body in Node fetch
            duplex: 'half',
        });

        // Stream response back including status + headers
        const resHeaders = new Headers(backendRes.headers);
        // Remove encoding headers that Node may have already decoded
        resHeaders.delete('content-encoding');
        resHeaders.delete('transfer-encoding');

        return new NextResponse(backendRes.body, {
            status: backendRes.status,
            headers: resHeaders,
        });
    } catch (err) {
        console.error('[API Proxy] Failed to reach backend:', targetUrl, err);
        return NextResponse.json(
            {
                success: false,
                message: 'Backend unreachable. Make sure the server is running.',
                data: null,
                errors: [(err as Error).message],
                meta: null,
            },
            { status: 502 }
        );
    }
}

// ── Route exports (one per HTTP method) ──────────────────────────────────────
type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
    const { path } = await ctx.params;
    return proxy(req, path);
}
