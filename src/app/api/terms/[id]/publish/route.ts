import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Utility function to transform snake_case API response to camelCase
const transformTermsData = (apiData: any) => {
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

// POST - Publish specific terms and conditions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const termsId = parseInt(resolvedParams.id);
    const body = await request.json();

    if (isNaN(termsId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid terms and conditions ID' },
        { status: 400 }
      );
    }

    // Optional effective date for publishing
    const effectiveDate = body.effectiveDate || new Date().toISOString().split('T')[0];

    // Call backend API
    const response = await apiService.post<any>(API_ENDPOINTS.TERMS.PUBLISH(termsId), {
      effective_date: effectiveDate,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to publish terms and conditions' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform response data
    const publishedTerms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Terms and conditions published successfully',
      data: publishedTerms
    });

  } catch (error) {
    console.error('Error publishing terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
