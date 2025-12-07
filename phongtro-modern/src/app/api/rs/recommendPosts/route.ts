import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

// Fallback function using Node.js http module
function fetchWithHttp(url: string, controller: AbortController, timeout: NodeJS.Timeout): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || '6000',
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const json = JSON.parse(data);
            resolve(NextResponse.json(json, { status: res.statusCode || 200 }));
          } catch (parseError) {
            resolve(NextResponse.json({ 
              success: false, 
              error: 'Invalid JSON response',
              raw: data.substring(0, 200)
            }, { status: 500 }));
          }
        });
      });

      req.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      controller.signal.addEventListener('abort', () => {
        req.destroy();
        clearTimeout(timeout);
        reject(new Error('Request aborted'));
      });

      req.end();
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Debug: Log the full URL
    const fullUrl = request.url;
    console.log('[RS API] Full request URL:', fullUrl);
    
    const { searchParams } = new URL(fullUrl);
    console.log('[RS API] Search params:', Object.fromEntries(searchParams.entries()));
    
    const postId = searchParams.get('postId');
    const topK = searchParams.get('topK') || '6';

    console.log('[RS API] Extracted postId:', postId);
    console.log('[RS API] Extracted topK:', topK);

    if (!postId) {
      console.error('[RS API] Missing postId parameter');
      console.error('[RS API] Available params:', Array.from(searchParams.keys()));
      console.error('[RS API] Full URL was:', fullUrl);
      return NextResponse.json({ 
        success: false, 
        error: 'Missing postId',
        debug: {
          url: fullUrl,
          params: Object.fromEntries(searchParams.entries()),
          availableKeys: Array.from(searchParams.keys())
        }
      }, { status: 400 });
    }

    // Try multiple URLs in case of network issues
    const rsBase = process.env.NEXT_PUBLIC_RS_URL || 'http://127.0.0.1:6000';
    const url = `${rsBase}/recommendPosts?postId=${encodeURIComponent(postId)}&topK=${encodeURIComponent(topK)}`;
    
    console.log('[RS API] Fetching from:', url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // Increase timeout
    try {
      // Try with additional fetch options for better compatibility
      const fetchOptions: RequestInit = {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Connection': 'close', // Force close connection
        },
        // Disable cache for server-side requests
        cache: 'no-store',
        // Add keepalive false for better compatibility
        keepalive: false,
      };
      
      console.log('[RS API] Attempting fetch to:', url);
      
      // Try fetch first (standard approach)
      let res: Response;
      try {
        res = await fetch(url, fetchOptions);
      } catch (fetchErr: any) {
        // If fetch fails, try with Node.js http module as fallback
        console.warn('[RS API] Fetch failed, trying Node.js http module:', fetchErr.message);
        return await fetchWithHttp(url, controller, timeout);
      }
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('[RS API] Non-OK response:', res.status, errorText);
        return NextResponse.json({ 
          success: false, 
          error: `RS service returned ${res.status}: ${errorText.substring(0, 100)}` 
        }, { status: res.status });
      }
      
      const text = await res.text();
      console.log('[RS API] Response status:', res.status);
      console.log('[RS API] Response length:', text.length);
      console.log('[RS API] Response preview:', text.substring(0, 200));
      
      let json: any = {};
      try { 
        json = JSON.parse(text);
        console.log('[RS API] Parsed JSON:', { 
          success: json.success, 
          dataLength: Array.isArray(json.data) ? json.data.length : 'not array',
          hasData: !!json.data
        });
      } catch (parseError) {
        console.error('[RS API] JSON parse error:', parseError);
        console.error('[RS API] Raw response:', text.substring(0, 500));
        json = { success: false, error: 'Invalid RS response format', raw: text.substring(0, 200) };
      }
      return NextResponse.json(json, { status: res.status });
    } catch (err: any) {
      clearTimeout(timeout);
      let reason = err?.name === 'AbortError' ? 'RS timeout' : (err?.message || 'RS network error');
      
      // Provide more helpful error messages
      if (err?.message?.includes('ECONNREFUSED') || err?.message?.includes('fetch failed')) {
        reason = 'Python Recommendation Service không chạy hoặc không thể kết nối. Vui lòng kiểm tra service trên port 6000.';
      } else if (err?.name === 'AbortError') {
        reason = 'RS timeout - Service không phản hồi trong 8 giây.';
      } else if (err?.code === 'ECONNREFUSED') {
        reason = 'Kết nối bị từ chối. Đảm bảo Python service đang chạy trên port 6000.';
      }
      
      console.error('[RS API] Fetch error details:', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        cause: err?.cause,
        errno: (err as any)?.errno,
        syscall: (err as any)?.syscall,
        address: (err as any)?.address,
        port: (err as any)?.port,
        stack: err?.stack?.substring(0, 500)
      });
      
      // Log the exact error for debugging
      if (err instanceof Error) {
        console.error('[RS API] Error instance:', err.constructor.name);
        console.error('[RS API] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      }
      
      return NextResponse.json({ 
        success: false, 
        error: reason,
        details: process.env.NODE_ENV === 'development' ? {
          name: err?.name,
          message: err?.message,
          code: err?.code
        } : undefined
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error('[RS API] General error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch RS' }, { status: 502 });
  }
}


