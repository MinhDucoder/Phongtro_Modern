import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use base URL without /api/v1 since we'll add it later
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: postId } = await params;
    console.log('Next.js API route - Updating post status with ID:', postId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Update post status failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Update post status request body:', body);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/posts/${postId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(body)
      }
    );

    console.log('Backend API update post status response status:', response.status);
    const data = await response.json();
    console.log('Backend API update post status response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin update post status API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
