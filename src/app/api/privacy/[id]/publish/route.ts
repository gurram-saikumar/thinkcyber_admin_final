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

// POST - Publish privacy policy (change status from Draft/Archived to Published)
export async function POST(
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
    const response = await apiService.post<any>(API_ENDPOINTS.PRIVACY.PUBLISH(id), {});

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to publish privacy policy' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const policy = response.data ? transformPrivacyData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Privacy policy published successfully',
      data: policy
    });

  } catch (error) {
    console.error('Error publishing privacy policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
