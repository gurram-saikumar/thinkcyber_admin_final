import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for subcategory data structure
interface SubCategory {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  status: 'Active' | 'Draft' | 'Inactive';
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Utility function to transform snake_case API response to camelCase
const transformSubCategoryData = (apiData: any): SubCategory => ({
  id: apiData.id,
  name: apiData.name,
  description: apiData.description,
  categoryId: apiData.category_id,
  categoryName: apiData.category_name,
  status: apiData.status,
  topicsCount: apiData.topics_count || 0,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at,
});

// GET - Fetch subcategories by category ID
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = parseInt(params.categoryId);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query parameters
    const queryParams: Record<string, any> = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    if (status && status !== 'all') queryParams.status = status;
    if (search) queryParams.search = search;

    // Call backend API using the BY_CATEGORY endpoint
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.BY_CATEGORY(categoryId), queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch subcategories for category' },
        { status: 500 }
      );
    }

    // Extract and transform data
    const rawSubcategories = response.data?.subcategories || response.data || [];
    const subcategories = rawSubcategories.map(transformSubCategoryData);

    const meta = response.data?.meta || response.meta || {
      total: subcategories.length,
      page,
      limit,
      totalPages: Math.ceil(subcategories.length / limit),
      categoryId,
    };

    // Calculate stats for this category
    const stats = {
      total: subcategories.length,
      active: subcategories.filter((sc: SubCategory) => sc.status === 'Active').length,
      draft: subcategories.filter((sc: SubCategory) => sc.status === 'Draft').length,
      inactive: subcategories.filter((sc: SubCategory) => sc.status === 'Inactive').length,
      totalTopics: subcategories.reduce((sum: number, sc: SubCategory) => sum + (sc.topicsCount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: subcategories,
      meta,
      stats,
      message: `Fetched ${subcategories.length} subcategory(ies) for category ${categoryId}`,
    });

  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
