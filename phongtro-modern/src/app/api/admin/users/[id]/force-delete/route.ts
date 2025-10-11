import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use base URL without /api/v1 since we'll add it later
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: userId } = await params;
    console.log('Next.js API route - Force deleting user with ID:', userId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Force delete user failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Force delete request body:', body);
    
    const apiUrl = `${API_BASE_URL}/api/v1/admin/users/${userId}/force-delete`;
    console.log('Force delete URL:', apiUrl);
    
    // Send the force delete request to the backend
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(body)
      }
    );

    console.log('Backend API force delete response status:', response.status);
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', text.substring(0, 200));
      return NextResponse.json(
        { success: false, message: 'Server returned invalid response format' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('Backend API force delete response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin force delete user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}