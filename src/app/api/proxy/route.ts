import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Decode the endpoint as it might contain multiple slashes
    // We only decode if it looks like it was encoded twice or if we want to be sure about slashes.
    // Actually searchParams.get() already decodes one layer.
    const targetUrl = `https://bolls.life/${endpoint}`;

    try {
        // Since this runs in Node.js, the workaround in repository.ts (setting NODE_TLS_REJECT_UNAUTHORIZED = '0')
        // should already be in effect if this file imports repository.ts or if we set it here.
        // To be safe and self-contained:
        const res = await fetch(targetUrl, {
            // @ts-ignore
            cache: 'no-store'
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'No error text');
            console.error(`Upstream error: ${res.status} for ${targetUrl}`, errorText);
            return NextResponse.json(
                { error: `Upstream error: ${res.status}`, details: errorText },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
