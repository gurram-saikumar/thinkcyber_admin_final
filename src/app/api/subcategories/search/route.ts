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

// GET - Search subcategories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build query parameters
    const queryParams: Record<string, any> = {
      q: query.trim(),
      limit,
      page,
    };

    if (categoryId && categoryId !== 'all') queryParams.categoryId = categoryId;
    if (status && status !== 'all') queryParams.status = status;

    // Call backend API
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.SEARCH, queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to search subcategories' },
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
      console.error('Error transforming subcategory data in search:', transformError);
      subcategories = [];
    }

    const meta = response.data?.meta || response.meta || {
      total: subcategories.length,
      page,
      limit,
      totalPages: Math.ceil(subcategories.length / limit),
      query: query.trim(),
    };

    return NextResponse.json({
      success: true,
      data: subcategories,
      meta,
      message: `Found ${subcategories.length} subcategory(ies) matching "${query.trim()}"`,
    });

  } catch (error) {
    console.error('Error searching subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
