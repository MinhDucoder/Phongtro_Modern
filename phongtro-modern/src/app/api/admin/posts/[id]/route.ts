import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use base URL without /api/v1 since we'll add it later
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: postId } = await params;
    console.log('Next.js API route - Getting post with ID:', postId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Get post failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/posts/${postId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}`
        },
      }
    );

    console.log('Backend API post response status:', response.status);
    const data = await response.json();
    console.log('Backend API post response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin get post API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: postId } = await params;
    console.log('Next.js API route - Updating post with ID:', postId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Update post failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Update post request body:', body);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/posts/${postId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(body)
      }
    );

    console.log('Backend API update post response status:', response.status);
    const data = await response.json();
    console.log('Backend API update post response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin update post API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: postId } = await params;
    console.log('Next.js API route - Deleting post with ID:', postId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Delete post failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/posts/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}`
        },
      }
    );

    console.log('Backend API delete post response status:', response.status);
    const data = await response.json();
    console.log('Backend API delete post response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin delete post API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
