import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use base URL without /api/v1 since we'll add it later
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    console.log('Next.js API route - Fetching analytics with range:', range);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      console.error('Get analytics failed: No access token found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/v1/admin/analytics?range=${range}`;
    console.log('Sending GET request to backend API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken.value}`,
        'Authorization': `Bearer ${accessToken.value}`
      },
    });

    console.log('Backend API analytics response status:', response.status);
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got HTML. First 200 chars:', text.substring(0, 200));
      console.error('Request URL was:', apiUrl);
      return NextResponse.json(
        { success: false, message: 'Server returned invalid response format (HTML instead of JSON). Analytics route may not exist on backend.' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('Backend API analytics response received');
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: String(error) },
      { status: 500 }
    );
  }
}
