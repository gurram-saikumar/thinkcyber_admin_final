import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for sub-category data structure
interface SubCategory {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  status: 'Active' | 'Draft' | 'Inactive';
  emoji?: string;
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubCategoryRequest {
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
}

// Minimal fallback data for subcategories - only used when backend is completely unavailable
const minimalSubcategoriesFallback: SubCategory[] = [
  {
    id: 1,
    name: 'Basic Security',
    description: 'Introduction to basic security concepts',
    categoryId: 1,
    categoryName: 'Cybersecurity Fundamentals',
    status: 'Active',
    emoji: '🔒',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Password Security',
    description: 'Password best practices and management',
    categoryId: 1,
    categoryName: 'Cybersecurity Fundamentals',
    status: 'Active',
    emoji: '🔑',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Firewall Management',
    description: 'Network firewall configuration and management',
    categoryId: 2,
    categoryName: 'Network Security',
    status: 'Active',
    emoji: '🔥',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'VPN Security',
    description: 'Virtual Private Network security',
    categoryId: 2,
    categoryName: 'Network Security',
    status: 'Active',
    emoji: '🔐',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    emoji: apiData.emoji,
    topicsCount: apiData.topics_count || apiData.topicsCount || 0,
    createdAt: apiData.created_at || apiData.createdAt || '',
    updatedAt: apiData.updated_at || apiData.updatedAt || '',
  };
};

// GET - Fetch all subcategories with optional filters
export async function GET(request: NextRequest) {
  console.log('🔍 Fetching all subcategories...');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased default limit
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const categoryId = searchParams.get('categoryId') || searchParams.get('category') || ''; // Support both parameter names
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Special parameter to fetch all subcategories without pagination
    const fetchAll = searchParams.get('fetchAll') === 'true';

    console.log('📊 Request parameters:', {
      page, limit, search, status, categoryId, sortBy, sortOrder, fetchAll
    });

    // Build query parameters
    const queryParams: Record<string, any> = {
      page: fetchAll ? 1 : page,
      limit: fetchAll ? 1000 : limit, // Large limit when fetching all
      sortBy,
      sortOrder,
    };

    if (search) queryParams.search = search;
    if (status && status !== 'all') queryParams.status = status;
    if (categoryId && categoryId !== 'all') queryParams.categoryId = categoryId;

    // Call backend API with fallback to mock data
    try {
      console.log('🌐 Attempting to call backend API for subcategories...');
      const response = await apiService.get(
        buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.BASE, queryParams)
      );

      console.log('🔍 API Response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        console.warn('⚠️ Backend API not available for subcategories, using fallback data immediately:', response.error);
        // Filter fallback data by category if specified
        let filteredSubcategories = minimalSubcategoriesFallback;
        if (categoryId && categoryId !== 'all') {
          const numericCategoryId = parseInt(categoryId);
          filteredSubcategories = minimalSubcategoriesFallback.filter(
            sc => sc.categoryId === numericCategoryId
          );
          console.log(`🔍 Filtered subcategories for category ${categoryId}:`, filteredSubcategories);
        }

        return NextResponse.json({
          success: true,
          data: filteredSubcategories,
          meta: { 
            total: filteredSubcategories.length, 
            page, 
            limit, 
            totalPages: Math.ceil(filteredSubcategories.length / limit) 
          },
          stats: {
            total: filteredSubcategories.length,
            active: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Active').length,
            draft: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Draft').length,
            inactive: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Inactive').length,
            totalTopics: filteredSubcategories.reduce((sum: number, sc: SubCategory) => sum + (sc.topicsCount || 0), 0),
          },
          message: 'Using fallback data - backend not available'
        });
      }

      console.log('✅ Backend API responded successfully for subcategories');
      // Extract subcategories data and transform snake_case to camelCase
      console.log('📊 Raw data structure:', {
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        hasSubcategories: !!response.data?.subcategories,
        subcategoriesType: Array.isArray(response.data?.subcategories) ? 'array' : typeof response.data?.subcategories
      });
      
      const rawSubcategories = response.data?.subcategories || response.data || [];
      let subcategories: SubCategory[] = [];
      
      try {
        subcategories = Array.isArray(rawSubcategories) 
          ? rawSubcategories.map(transformSubCategoryData) 
          : [];
      } catch (transformError) {
        console.error('Error transforming subcategory data:', transformError);
        console.error('Raw data that caused error:', rawSubcategories);
        subcategories = [];
      }

      const meta = response.data?.meta || response.meta || {
        total: subcategories.length,
        page: fetchAll ? 1 : page,
        limit: fetchAll ? subcategories.length : limit,
        totalPages: fetchAll ? 1 : Math.ceil(subcategories.length / limit),
      };

      // Additional stats calculation
      const stats = response.data?.stats || {
        total: subcategories.length,
        active: subcategories.filter((sc: SubCategory) => sc.status === 'Active').length,
        draft: subcategories.filter((sc: SubCategory) => sc.status === 'Draft').length,
        inactive: subcategories.filter((sc: SubCategory) => sc.status === 'Inactive').length,
        totalTopics: subcategories.reduce((sum: number, sc: SubCategory) => sum + (sc.topicsCount || 0), 0),
        averageTopicsPerSubcategory: subcategories.length > 0 
          ? (subcategories.reduce((sum: number, sc: SubCategory) => sum + (sc.topicsCount || 0), 0) / subcategories.length).toFixed(1)
          : '0',
        categoriesUsed: new Set(subcategories.map(sc => sc.categoryId)).size,
      };

      // Fetch categories for dropdown (required by frontend)
      let categories: { id: number; name: string }[] = [];
      try {
        const categoriesResponse = await apiService.get(
          buildApiUrlWithQuery(API_ENDPOINTS.CATEGORIES.BASE, { fetchAll: 'true' })
        );
        if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
          categories = categoriesResponse.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name
          }));
        }
      } catch (error) {
        console.error('Error fetching categories for dropdown:', error);
        // Fallback: extract unique categories from subcategories
        const uniqueCategories = Array.from(
          new Map(subcategories.map(sc => [sc.categoryId, { id: sc.categoryId, name: sc.categoryName }]))
            .values()
        ).filter(cat => cat.id && cat.name);
        categories = uniqueCategories as { id: number; name: string }[];
      }

      return NextResponse.json({
        success: true,
        data: subcategories,
        meta,
        stats,
        categories, // ← This is required by the frontend
        message: fetchAll ? `Fetched all ${subcategories.length} subcategories` : `Fetched ${subcategories.length} subcategories (page ${page})`,
      });

    } catch (error) {
      console.warn('⚠️ Backend API connection failed for subcategories, using fallback data immediately:', error);
      // Filter fallback data by category if specified
      let filteredSubcategories = minimalSubcategoriesFallback;
      if (categoryId && categoryId !== 'all') {
        const numericCategoryId = parseInt(categoryId);
        filteredSubcategories = minimalSubcategoriesFallback.filter(
          sc => sc.categoryId === numericCategoryId
        );
        console.log(`🔍 Filtered subcategories for category ${categoryId}:`, filteredSubcategories);
      }

      return NextResponse.json({
        success: true,
        data: filteredSubcategories,
        meta: { 
          total: filteredSubcategories.length, 
          page, 
          limit, 
          totalPages: Math.ceil(filteredSubcategories.length / limit) 
        },
        stats: {
          total: filteredSubcategories.length,
          active: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Active').length,
          draft: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Draft').length,
          inactive: filteredSubcategories.filter((sc: SubCategory) => sc.status === 'Inactive').length,
          totalTopics: filteredSubcategories.reduce((sum: number, sc: SubCategory) => sum + (sc.topicsCount || 0), 0),
        },
        message: 'Using fallback data - backend connection failed'
      });
    }

  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    const body: CreateSubCategoryRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.categoryId || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, categoryId, status' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Subcategory name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Validate description length
    if (body.description.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.post<any>(API_ENDPOINTS.SUBCATEGORIES.BASE, {
      name: body.name.trim(),
      description: body.description.trim(),
      category_id: body.categoryId,
      status: body.status,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create subcategory' },
        { status: response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const subcategory = response.data ? transformSubCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
