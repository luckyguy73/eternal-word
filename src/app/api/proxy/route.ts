import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ENDPOINT_REGEX = /^(get-random-verse|get-verse|get-chapter)\/[a-zA-Z0-9_\-\/]+$/;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    if (endpoint.includes('..') || endpoint.includes('//') || !ALLOWED_ENDPOINT_REGEX.test(endpoint)) {
        return NextResponse.json({ error: 'Invalid or unauthorized endpoint' }, { status: 400 });
    }

    const targetUrl = `https://bolls.life/${endpoint}`;

    try {
        const res = await fetch(targetUrl, {
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
    } catch (error: unknown) {
        console.error('Proxy error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
