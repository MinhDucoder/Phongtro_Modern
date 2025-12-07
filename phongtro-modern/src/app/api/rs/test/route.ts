import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const testUrls = [
      'http://localhost:6000/health',
      'http://127.0.0.1:6000/health',
    ];

    const results: any[] = [];

    for (const url of testUrls) {
      try {
        console.log(`[RS Test] Testing: ${url}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        
        clearTimeout(timeout);
        const data = await res.json().catch(() => ({ error: 'Invalid JSON' }));
        
        results.push({
          url,
          success: res.ok,
          status: res.status,
          data,
        });
      } catch (err: any) {
        results.push({
          url,
          success: false,
          error: err.message,
          code: err.code,
          name: err.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Test completed. Check which URL works.',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

