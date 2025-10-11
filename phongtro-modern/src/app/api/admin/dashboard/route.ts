import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';
    
    // Tránh đường dẫn trùng lặp /api/v1
    const apiBaseUrl = apiUrl.endsWith('/api/v1') 
      ? apiUrl.substring(0, apiUrl.length - 7) 
      : apiUrl;
    
    console.log('API URL for admin dashboard:', `${apiBaseUrl}/api/v1/admin/dashboard`);
    
    const response = await fetch(`${apiBaseUrl}/api/v1/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // Forward cookies for authentication
      },
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Không thể tải dữ liệu dashboard' 
      },
      { status: 500 }
    );
  }
}
