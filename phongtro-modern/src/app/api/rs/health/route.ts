import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const rsBase = process.env.NEXT_PUBLIC_RS_URL || 'http://localhost:5001';
    const url = `${rsBase}/health`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({ status: 'unknown' }));
      return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
      clearTimeout(timeout);
      const reason = err?.name === 'AbortError' ? 'RS timeout' : (err?.message || 'RS network error');
      return NextResponse.json({ success: false, error: reason }, { status: 502 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to reach RS' }, { status: 502 });
  }
}


