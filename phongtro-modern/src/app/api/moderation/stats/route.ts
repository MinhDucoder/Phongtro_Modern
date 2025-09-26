import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d';
    const moderatorId = searchParams.get('moderatorId') || '';
    const city = searchParams.get('city') || '';
    const category = searchParams.get('category') || '';

    // Construct query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (moderatorId) queryParams.append('moderatorId', moderatorId);
    if (city) queryParams.append('city', city);
    if (category) queryParams.append('category', category);
    
    // Get data from backend
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/moderation/stats?${queryParams.toString()}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });
    
    // Parse the response data
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching moderation stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch moderation statistics', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}