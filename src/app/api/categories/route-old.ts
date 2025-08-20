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

// Sample data - in production, this would come from a database
let categories: Category[] = [
  {
    id: 1,
    name: 'Cybersecurity Fundamentals',
    description: 'Basic cybersecurity concepts and principles',
    topicsCount: 25,
    status: 'Active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Network Security',
    description: 'Securing networks and network infrastructure',
    topicsCount: 18,
    status: 'Active',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    name: 'Ethical Hacking',
    description: 'Penetration testing and ethical hacking techniques',
    topicsCount: 32,
    status: 'Active',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    name: 'Digital Forensics',
    description: 'Investigation of digital crimes and evidence analysis',
    topicsCount: 15,
    status: 'Draft',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  }
];

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredCategories = [...categories];

    // Apply search filter
    if (search) {
      filteredCategories = filteredCategories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredCategories = filteredCategories.filter(category =>
        category.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      total: categories.length,
      active: categories.filter(c => c.status === 'Active').length,
      draft: categories.filter(c => c.status === 'Draft').length,
      inactive: categories.filter(c => c.status === 'Inactive').length,
      totalTopics: categories.reduce((sum, c) => sum + (c.topicsCount || 0), 0),
      averageTopicsPerCategory: categories.length > 0 
        ? (categories.reduce((sum, c) => sum + (c.topicsCount || 0), 0) / categories.length).toFixed(1)
        : '0'
    };

    return NextResponse.json({
      success: true,
      data: paginatedCategories,
      pagination: {
        page,
        limit,
        total: filteredCategories.length,
        totalPages: Math.ceil(filteredCategories.length / limit)
      },
      stats
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

    // Check if category name already exists
    const existingCategory = categories.find(
      category => category.name.toLowerCase() === body.name.toLowerCase()
    );

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Create new category
    const newCategory: Category = {
      id: Math.max(...categories.map(c => c.id || 0)) + 1,
      name: body.name.trim(),
      description: body.description.trim(),
      status: body.status,
      topicsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    categories.push(newCategory);

    // Simulate database operation delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
