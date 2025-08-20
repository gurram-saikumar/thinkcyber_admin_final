import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// GET - Fetch homepage content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'en';

    // Call backend API using apiService
    const response = await apiService.get(`${API_ENDPOINTS.HOMEPAGE.CONTENT}?language=${language}`);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch homepage content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update homepage content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend API using apiService
    const response = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, body);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create/update homepage content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Homepage content created/updated successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Error creating/updating homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
