import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/users/${params.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`
        }
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin get user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/users/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin update user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    console.log('Next.js API route - Deleting user with ID:', userId);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('DELETE user failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Sending DELETE request to backend API:', `${API_BASE_URL}/api/v1/admin/users/${userId}`);
    
    // Try direct deletion first
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${accessToken.value}`,
          'Authorization': `Bearer ${accessToken.value}` // Try with Authorization header too
        }
      }
    );

    console.log('Backend API response status:', response.status);
    const data = await response.json();
    console.log('Backend API response data:', data);
    
    // If the server returned 200 but the deletion didn't work,
    // we'll try a different approach with a POST request and method override
    if (response.status === 200 && data.success !== true) {
      console.log('DELETE was successful but data indicates failure, trying alternate method');
      
      const alternateResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/${userId}/force-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `accessToken=${accessToken.value}`,
            'Authorization': `Bearer ${accessToken.value}`
          },
          body: JSON.stringify({ _method: 'DELETE' })
        }
      );
      
      const alternateData = await alternateResponse.json();
      console.log('Alternate method response:', alternateData);
      
      return NextResponse.json(alternateData, { status: alternateResponse.status });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin delete user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}