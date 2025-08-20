import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

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

interface CreatePrivacyRequest {
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

// GET - Fetch all privacy policies with optional filters
export async function GET(request: NextRequest) {
  console.log('🔍 Fetching all privacy policies...');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const language = searchParams.get('language') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Special parameter to fetch all privacy policies without pagination
    const fetchAll = searchParams.get('fetchAll') === 'true';

    console.log('📊 Request parameters:', {
      page, limit, search, status, language, sortBy, sortOrder, fetchAll
    });

    // Build query parameters
    const queryParams: Record<string, any> = {
      page: fetchAll ? 1 : page,
      limit: fetchAll ? 1000 : limit,
      sortBy,
      sortOrder,
    };

    if (search) queryParams.search = search;
    if (status && status !== 'all') queryParams.status = status;
    if (language && language !== 'all') queryParams.language = language;

    // Call backend API
    const response = await apiService.get(
      buildApiUrlWithQuery(API_ENDPOINTS.PRIVACY.BASE, queryParams)
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to fetch privacy policies' },
        { status: 500 }
      );
    }

    // Extract privacy policies data and transform snake_case to camelCase
    const rawPolicies = response.data?.privacy_policies || response.data || [];
    let policies: PrivacyPolicy[] = [];
    
    try {
      policies = Array.isArray(rawPolicies) 
        ? rawPolicies.map(transformPrivacyData) 
        : [];
    } catch (transformError) {
      console.error('❌ Error transforming privacy policies data:', transformError);
      return NextResponse.json(
        { success: false, error: 'Failed to process privacy policies data' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: policies.length,
      draft: policies.filter(p => p.status === 'Draft').length,
      published: policies.filter(p => p.status === 'Published').length,
      archived: policies.filter(p => p.status === 'Archived').length,
      languages: Array.from(new Set(policies.map(p => p.language))).length,
      latestVersion: policies.reduce((latest, current) => {
        const currentVersion = parseFloat(current.version);
        const latestVersion = parseFloat(latest);
        return currentVersion > latestVersion ? current.version : latest;
      }, '1.0')
    };

    console.log('✅ Successfully fetched privacy policies:', {
      total: policies.length,
      stats
    });

    return NextResponse.json({
      success: true,
      data: policies,
      stats,
      meta: {
        total: policies.length,
        page: fetchAll ? 1 : page,
        limit: fetchAll ? policies.length : limit,
        totalPages: fetchAll ? 1 : Math.ceil(policies.length / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in privacy policies GET route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch privacy policies'
      },
      { status: 500 }
    );
  }
}

// POST - Create new privacy policy
export async function POST(request: NextRequest) {
  console.log('📝 Creating new privacy policy...');
  try {
    const body: CreatePrivacyRequest = await request.json();
    
    console.log('📊 Privacy policy data to create:', body);

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!body.version?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Version is required' },
        { status: 400 }
      );
    }

    // Transform camelCase to snake_case for backend API
    const apiData = {
      title: body.title.trim(),
      content: body.content.trim(),
      version: body.version.trim(),
      language: body.language || 'en',
      status: body.status || 'Draft',
      effective_date: body.effectiveDate || null,
    };

    console.log('🚀 Sending privacy policy data to backend:', apiData);

    // Call backend API
    const response = await apiService.post(API_ENDPOINTS.PRIVACY.BASE, apiData);

    if (!response.success) {
      console.error('❌ Backend API error:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create privacy policy' },
        { status: 500 }
      );
    }

    // Transform response back to camelCase
    const createdPolicy = transformPrivacyData(response.data);

    console.log('✅ Successfully created privacy policy:', createdPolicy);

    return NextResponse.json({
      success: true,
      data: createdPolicy,
      message: 'Privacy policy created successfully'
    });

  } catch (error) {
    console.error('❌ Error in privacy policy POST route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create privacy policy'
      },
      { status: 500 }
    );
  }
}
