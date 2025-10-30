import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const topK = searchParams.get('topK') || '6';

    if (!postId) {
      return NextResponse.json({ success: false, error: 'Missing postId' }, { status: 400 });
    }

    const rsBase = process.env.NEXT_PUBLIC_RS_URL || 'http://localhost:5001';
    const url = `${rsBase}/recommendPosts?postId=${encodeURIComponent(postId)}&topK=${encodeURIComponent(topK)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timeout);
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch {
        json = { success: false, error: 'Invalid RS response', raw: text };
      }
      return NextResponse.json(json, { status: res.status });
    } catch (err: any) {
      clearTimeout(timeout);
      const reason = err?.name === 'AbortError' ? 'RS timeout' : (err?.message || 'RS network error');
      return NextResponse.json({ success: false, error: reason }, { status: 502 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch RS' }, { status: 502 });
  }
}


