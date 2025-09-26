import { NextRequest, NextResponse } from 'next/server';

/**
 * API handler for serving post data for moderation review
 * GET /api/admin/moderation/post/:postId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    if (!postId) {
      return NextResponse.json({ success: false, message: 'ID bài đăng không hợp lệ' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/moderation/post/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include cookies for authentication
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, message: error.message || 'Không thể tải dữ liệu bài đăng' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in moderation post API:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi tải dữ liệu bài đăng' },
      { status: 500 }
    );
  }
}

/**
 * API handler for updating post moderation status
 * PUT /api/admin/moderation/post/:postId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    if (!postId) {
      return NextResponse.json({ success: false, message: 'ID bài đăng không hợp lệ' }, { status: 400 });
    }
    
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/moderation/post/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Include cookies for authentication
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, message: error.message || 'Không thể cập nhật trạng thái bài đăng' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in moderation update API:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi cập nhật trạng thái bài đăng' },
      { status: 500 }
    );
  }
}