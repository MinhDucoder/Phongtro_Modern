import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use base URL without /api/v1 since it's already included in NEXT_PUBLIC_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('Next.js API route - Fetching users with params:', searchParams.toString());
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Get users failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Now correctly construct the API URL to avoid duplication of /api/v1
    const apiUrl = `${API_BASE_URL}/api/v1/admin/users?${searchParams.toString()}`;
    console.log('Sending GET request to backend API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken.value}`,
        'Authorization': `Bearer ${accessToken.value}` // Add Authorization header too
      },
    });

    console.log('Backend API users response status:', response.status);
    const data = await response.json();
    console.log('Backend API users response data length:', 
                data?.data?.users?.length || 'No users data found');
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}