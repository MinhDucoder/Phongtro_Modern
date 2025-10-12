import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status') || 'active';
    const page = searchParams.get('page') || '1';

    // Gọi API backend để lấy danh sách posts
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const apiUrl = `${backendUrl}/api/v1/posts?limit=${limit}&status=${status}&page=${page}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch posts' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
