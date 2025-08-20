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
const transformSubCategoryData = (apiData: any): SubCategory => {
  if (!apiData) {
    throw new Error('Invalid subcategory data: data is null or undefined');
  }
  
  return {
    id: apiData.id,
    name: apiData.name || '',
    description: apiData.description || '',
    categoryId: apiData.category_id || apiData.categoryId || 0,
    categoryName: apiData.category_name || apiData.categoryName || '',
    status: apiData.status || 'Draft',
    topicsCount: apiData.topics_count || apiData.topicsCount || 0,
    createdAt: apiData.created_at || apiData.createdAt || '',
    updatedAt: apiData.updated_at || apiData.updatedAt || '',
  };
};

// GET - Fetch all active subcategories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query parameters with status filter for active only
    const queryParams: Record<string, any> = {
      page,
      limit,
      sortBy,
      sortOrder,
      status: 'Active', // Force active status
    };

    if (search) queryParams.search = search;
    if (categoryId && categoryId !== 'all') queryParams.categoryId = categoryId;

    // Call backend API
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.ACTIVE, queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch active subcategories' },
        { status: 500 }
      );
    }

    // Extract and transform data
    const rawSubcategories = response.data?.subcategories || response.data || [];
    let subcategories: SubCategory[] = [];
    
    try {
      subcategories = Array.isArray(rawSubcategories) 
        ? rawSubcategories.map(transformSubCategoryData) 
        : [];
    } catch (transformError) {
      console.error('Error transforming subcategory data in active:', transformError);
      subcategories = [];
    }

    const meta = response.data?.meta || response.meta || {
      total: subcategories.length,
      page,
      limit,
      totalPages: Math.ceil(subcategories.length / limit),
      status: 'Active',
    };

    return NextResponse.json({
      success: true,
      data: subcategories,
      meta,
      message: `Fetched ${subcategories.length} active subcategory(ies)`,
    });

  } catch (error) {
    console.error('Error fetching active subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
