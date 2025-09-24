import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Forwarding forgot password request to backend:', body.email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Backend response status:', response.status);
      
      const data = await response.json();
      console.log('Backend response data:', data);

      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      console.error('Error fetching backend API:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}