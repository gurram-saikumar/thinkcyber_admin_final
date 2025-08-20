import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

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

interface UpdateCategoryRequest {
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
  topicsCount: apiData.topics_count || 0,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at,
});

// GET - Fetch a specific category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.get<any>(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Category not found' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const category = transformCategoryData(response.data);

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);
    const body: UpdateCategoryRequest = await request.json();

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

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
    const response = await apiService.put<any>(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId), {
      name: body.name.trim(),
      description: body.description.trim(),
      status: body.status,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update category' },
        { status: response.error?.includes('not found') ? 404 : 
          response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const category = response.data ? transformCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.delete<any>(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete category' },
        { status: response.error?.includes('not found') ? 404 : 
          response.error?.includes('existing topics') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase if data is returned
    const category = response.data ? transformCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
