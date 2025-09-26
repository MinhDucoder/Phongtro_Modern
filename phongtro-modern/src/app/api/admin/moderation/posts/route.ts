import { NextRequest, NextResponse } from 'next/server';

/**
 * API handler for getting posts pending moderation
 * GET /api/admin/moderation/pending
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'pending';

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/moderation/posts?page=${page}&limit=${limit}&status=${status}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include cookies for authentication
          'Cookie': request.headers.get('cookie') || '',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, message: error.message || 'Không thể tải danh sách bài đăng' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in moderation pending API:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi tải danh sách bài đăng' },
      { status: 500 }
    );
  }
}