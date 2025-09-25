import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Create a cleaned response to see what filters are being applied
    const appliedFilters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || null,
      role: searchParams.get('role') || 'all',
      status: searchParams.get('status') || 'all',
    };

    // Return the applied filters for debugging
    return NextResponse.json({
      success: true,
      message: 'Debug information',
      data: {
        appliedFilters,
        rawParams: Object.fromEntries(searchParams.entries())
      }
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error in debug route',
      error: String(error)
    });
  }
}