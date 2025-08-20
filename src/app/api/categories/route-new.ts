import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for category data structure
interface Category {
  id?: number;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCategoryRequest {
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

// GET - Fetch all categories with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Build query parameters
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (search) queryParams.search = search;
    if (status && status !== 'all') queryParams.status = status;

    // Call backend API
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.CATEGORIES.BASE, queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data?.categories || response.data || [],
      meta: response.data?.meta || response.meta || {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
      stats: response.data?.stats,
    });

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
    const response = await apiService.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, {
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

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: response.data
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
