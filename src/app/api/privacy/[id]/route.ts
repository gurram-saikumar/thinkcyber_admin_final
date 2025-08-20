import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Interface for Privacy Policy data structure
interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  version: string;
  language: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface UpdatePrivacyRequest {
  title: string;
  content: string;
  version: string;
  language: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
}

// Utility function to transform snake_case API response to camelCase
const transformPrivacyData = (apiData: any): PrivacyPolicy => {
  if (!apiData) {
    throw new Error('Invalid privacy policy data: data is null or undefined');
  }
  
  return {
    id: apiData.id,
    title: apiData.title || '',
    content: apiData.content || '',
    version: apiData.version || '1.0',
    language: apiData.language || 'en',
    status: apiData.status || 'Draft',
    effectiveDate: apiData.effective_date || apiData.effectiveDate || '',
    createdAt: apiData.created_at || apiData.createdAt || '',
    updatedAt: apiData.updated_at || apiData.updatedAt || '',
    createdBy: apiData.created_by || apiData.createdBy || '',
    updatedBy: apiData.updated_by || apiData.updatedBy || '',
  };
};

// GET - Fetch specific privacy policy by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy ID is required' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.get(API_ENDPOINTS.PRIVACY.BY_ID(id));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch privacy policy' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const policy = response.data ? transformPrivacyData(response.data) : null;

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Privacy policy retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing privacy policy
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: UpdatePrivacyRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || !body.content || !body.version || !body.language || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content, version, language, status' },
        { status: 400 }
      );
    }

    // Validate title length
    if (body.title.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy title must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // Validate content length
    if (body.content.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Content must be at least 50 characters long' },
        { status: 400 }
      );
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+$/;
    if (!versionRegex.test(body.version)) {
      return NextResponse.json(
        { success: false, error: 'Version must be in format X.Y (e.g., 1.0, 2.1)' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.put<any>(API_ENDPOINTS.PRIVACY.BY_ID(id), {
      title: body.title.trim(),
      content: body.content.trim(),
      version: body.version,
      language: body.language,
      status: body.status,
      effective_date: body.effectiveDate || null,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update privacy policy' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const policy = response.data ? transformPrivacyData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Privacy policy updated successfully',
      data: policy
    });

  } catch (error) {
    console.error('Error updating privacy policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete privacy policy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy ID is required' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.delete(API_ENDPOINTS.PRIVACY.BY_ID(id));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete privacy policy' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy policy deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting privacy policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
