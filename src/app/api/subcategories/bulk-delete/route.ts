import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface BulkDeleteRequest {
  ids: number[];
}

// POST - Bulk delete subcategories
export async function POST(request: NextRequest) {
  try {
    const body: BulkDeleteRequest = await request.json();

    // Validate required fields
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: ids (must be non-empty array)' },
        { status: 400 }
      );
    }

    // Validate that all IDs are numbers
    const invalidIds = body.ids.filter(id => typeof id !== 'number' || id <= 0);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'All IDs must be positive numbers' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.post<any>(API_ENDPOINTS.SUBCATEGORIES.BULK_DELETE, {
      ids: body.ids,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete subcategories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${body.ids.length} subcategory(ies)`,
      data: response.data
    });

  } catch (error) {
    console.error('Error bulk deleting subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
