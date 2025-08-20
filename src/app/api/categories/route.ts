import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for category data structure
interface Category {
  id?: number;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
  emoji?: string;
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCategoryRequest {
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

// Utility function to transform snake_case API response to camelCase
const transformCategoryData = (apiData: any): Category => ({
  id: apiData.id,
  name: apiData.name,
  description: apiData.description,
  status: apiData.status,
  emoji: apiData.emoji,
  topicsCount: apiData.topics_count || 0,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at,
});

// Minimal fallback data - only used when backend is completely unavailable
const minimalFallback: Category[] = [
  {
    id: 1,
    name: 'Cybersecurity Fundamentals',
    description: 'Basic cybersecurity concepts and principles',
    status: 'Active',
    emoji: '🔐',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Network Security',
    description: 'Network security concepts and best practices',
    status: 'Active',
    emoji: '🌐',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Data Protection',
    description: 'Data security and privacy protection',
    status: 'Active',
    emoji: '🛡️',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Threat Management',
    description: 'Understanding and managing security threats',
    status: 'Active',
    emoji: '⚠️',
    topicsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET - Fetch all categories with optional filters
export async function GET(request: NextRequest) {
  console.log('🔍 Fetching all categories...');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased default limit
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Special parameter to fetch all categories without pagination
    const fetchAll = searchParams.get('fetchAll') === 'true';

    console.log('📊 Request parameters:', {
      page, limit, search, status, sortBy, sortOrder, fetchAll
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

    // Call backend API with fallback to mock data
    try {
      console.log('🌐 Attempting to call backend API for categories...');
      const response = await apiService.get(
        buildApiUrlWithQuery(API_ENDPOINTS.CATEGORIES.BASE, queryParams)
      );

      if (!response.success) {
        console.warn('⚠️ Backend API not available, using minimal fallback:', response.error);
        // Return minimal fallback data
        return NextResponse.json({
          success: true,
          data: minimalFallback,
          meta: { total: minimalFallback.length, page, limit, totalPages: Math.ceil(minimalFallback.length / limit) },
          stats: {
            total: minimalFallback.length,
            active: minimalFallback.filter((cat: Category) => cat.status === 'Active').length,
            draft: minimalFallback.filter((cat: Category) => cat.status === 'Draft').length,
            inactive: minimalFallback.filter((cat: Category) => cat.status === 'Inactive').length,
            totalTopics: minimalFallback.reduce((sum: number, cat: Category) => sum + (cat.topicsCount || 0), 0),
          },
          message: 'Using minimal fallback - backend not available'
        });
      }

      console.log('✅ Backend API responded successfully for categories');
      // Extract categories data and transform snake_case to camelCase
      const rawCategories = response.data?.categories || response.data || [];
      const categories = rawCategories.map(transformCategoryData);

      const meta = response.data?.meta || response.meta || {
        total: categories.length,
        page: fetchAll ? 1 : page,
        limit: fetchAll ? categories.length : limit,
        totalPages: fetchAll ? 1 : Math.ceil(categories.length / limit),
      };

      // Additional stats calculation
      const stats = response.data?.stats || {
        total: categories.length,
        active: categories.filter((cat: Category) => cat.status === 'Active').length,
        draft: categories.filter((cat: Category) => cat.status === 'Draft').length,
        inactive: categories.filter((cat: Category) => cat.status === 'Inactive').length,
        totalTopics: categories.reduce((sum: number, cat: Category) => sum + (cat.topicsCount || 0), 0),
      };

      return NextResponse.json({
        success: true,
        data: categories,
        meta,
        stats,
        message: fetchAll ? `Fetched all ${categories.length} categories from backend` : `Fetched ${categories.length} categories from backend (page ${page})`,
      });

    } catch (error) {
      console.warn('⚠️ Backend API connection failed, using minimal fallback immediately:', error);
      // Return minimal fallback data
      return NextResponse.json({
        success: true,
        data: minimalFallback,
        meta: { total: minimalFallback.length, page, limit, totalPages: Math.ceil(minimalFallback.length / limit) },
        stats: {
          total: minimalFallback.length,
          active: minimalFallback.filter((cat: Category) => cat.status === 'Active').length,
          draft: minimalFallback.filter((cat: Category) => cat.status === 'Draft').length,
          inactive: minimalFallback.filter((cat: Category) => cat.status === 'Inactive').length,
          totalTopics: minimalFallback.reduce((sum: number, cat: Category) => sum + (cat.topicsCount || 0), 0),
        },
        message: 'Using minimal fallback - backend connection failed'
      });
    }

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, status' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Category name must be at least 3 characters long' },
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
    const response = await apiService.post<any>(API_ENDPOINTS.CATEGORIES.BASE, {
      name: body.name.trim(),
      description: body.description.trim(),
      status: body.status,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create category' },
        { status: response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const category = response.data ? transformCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
