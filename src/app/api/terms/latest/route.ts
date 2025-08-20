import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

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

// GET - Fetch latest published terms and conditions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'en';

    // Build query parameters
    const queryParams: Record<string, any> = {
      language: language.toLowerCase(),
    };

    // Call backend API
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.TERMS.LATEST, queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'No published terms and conditions found' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform response data
    const latestTerms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      data: latestTerms,
      message: `Latest terms and conditions retrieved for language: ${language}`
    });

  } catch (error) {
    console.error('Error fetching latest terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
