import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// GET - Get subcategories count with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';

    // Build query parameters
    const queryParams: Record<string, any> = {};
    if (status && status !== 'all') queryParams.status = status;
    if (categoryId && categoryId !== 'all') queryParams.categoryId = categoryId;

    // Call backend API
    const endpoint = API_ENDPOINTS.SUBCATEGORIES.COUNT + 
      (Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '');
    
    const response = await apiService.get(endpoint);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to get subcategories count' },
        { status: 500 }
      );
    }

    const counts = response.data || {
      total: 0,
      active: 0,
      draft: 0,
      inactive: 0,
    };

    return NextResponse.json({
      success: true,
      data: counts,
      message: 'Subcategories count retrieved successfully',
    });

  } catch (error) {
    console.error('Error getting subcategories count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
