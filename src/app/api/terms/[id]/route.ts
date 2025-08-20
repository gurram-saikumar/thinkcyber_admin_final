import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Interface for Terms and Conditions data structure
interface TermsAndConditions {
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

interface UpdateTermsRequest {
  title: string;
  content: string;
  version: string;
  language: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
}

// Utility function to transform snake_case API response to camelCase
const transformTermsData = (apiData: any): TermsAndConditions => {
  if (!apiData) {
    throw new Error('Invalid terms data: data is null or undefined');
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

// GET - Fetch specific terms and conditions by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const termsId = parseInt(params.id);

    if (isNaN(termsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid terms and conditions ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.get(API_ENDPOINTS.TERMS.BY_ID(termsId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Terms and conditions not found' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const terms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      data: terms
    });

  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update specific terms and conditions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const termsId = parseInt(resolvedParams.id);
    const body: UpdateTermsRequest = await request.json();

    if (isNaN(termsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid terms and conditions ID' },
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
        { success: false, error: 'Title must be at least 5 characters long' },
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
    const response = await apiService.put<any>(API_ENDPOINTS.TERMS.BY_ID(termsId), {
      title: body.title.trim(),
      content: body.content.trim(),
      version: body.version,
      language: body.language.toLowerCase(),
      status: body.status,
      effective_date: body.effectiveDate || null,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update terms and conditions' },
        { status: response.error?.includes('not found') ? 404 : response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const updatedTerms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Terms and conditions updated successfully',
      data: updatedTerms
    });

  } catch (error) {
    console.error('Error updating terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific terms and conditions
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const termsId = parseInt(resolvedParams.id);

    if (isNaN(termsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid terms and conditions ID' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.delete<any>(API_ENDPOINTS.TERMS.BY_ID(termsId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete terms and conditions' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform response data if available
    const deletedTerms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Terms and conditions deleted successfully',
      data: deletedTerms
    });

  } catch (error) {
    console.error('Error deleting terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
