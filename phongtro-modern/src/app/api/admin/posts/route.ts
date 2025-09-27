import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('Next.js API route - Fetching posts with params:', searchParams.toString());
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Get posts failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/v1/admin/posts?${searchParams.toString()}`;
    console.log('Sending GET request to backend API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken.value}`,
        'Authorization': `Bearer ${accessToken.value}`
      },
    });

    console.log('Backend API posts response status:', response.status);
    const data = await response.json();
    console.log('Backend API posts response data length:', 
                data?.data?.posts?.length || 'No posts data found');
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin posts API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
