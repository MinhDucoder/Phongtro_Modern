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
    const { id: userId } = await params;
    console.log('Next.js API route - Banning/unbanning user with ID:', userId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Ban user failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Ban request body:', body);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/users/${userId}/ban`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}` // Add Authorization header too
        },
        body: JSON.stringify(body)
      }
    );

    console.log('Backend API ban response status:', response.status);
    const data = await response.json();
    console.log('Backend API ban response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin ban user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}