import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Interface for sub-category data structure
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

interface UpdateSubCategoryRequest {
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
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

// GET - Fetch a specific sub-category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subCategoryId = parseInt(params.id);

    if (isNaN(subCategoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sub-category ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.get(API_ENDPOINTS.SUBCATEGORIES.BY_ID(subCategoryId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Sub-category not found' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const subCategory = response.data ? transformSubCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      data: subCategory
    });

  } catch (error) {
    console.error('Error fetching sub-category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific sub-category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subCategoryId = parseInt(params.id);
    const body: UpdateSubCategoryRequest = await request.json();

    if (isNaN(subCategoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sub-category ID' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Sub-category name must be at least 3 characters long' },
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
    const response = await apiService.put<any>(API_ENDPOINTS.SUBCATEGORIES.UPDATE(subCategoryId), {
      name: body.name.trim(),
      description: body.description.trim(),
      category_id: body.categoryId,
      status: body.status,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update sub-category' },
        { status: response.error?.includes('not found') ? 404 : response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const updatedSubCategory = response.data ? transformSubCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Sub-category updated successfully',
      data: updatedSubCategory
    });

  } catch (error) {
    console.error('Error updating sub-category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific sub-category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subCategoryId = parseInt(params.id);

    if (isNaN(subCategoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sub-category ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.delete<any>(API_ENDPOINTS.SUBCATEGORIES.DELETE(subCategoryId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete sub-category' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform response data if available
    const deletedSubCategory = response.data ? transformSubCategoryData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Sub-category deleted successfully',
      data: deletedSubCategory
    });

  } catch (error) {
    console.error('Error deleting sub-category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
