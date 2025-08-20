import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

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

interface CreateTermsRequest {
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

// GET - Fetch all terms and conditions with optional filters
export async function GET(request: NextRequest) {
  console.log('🔍 Fetching all terms and conditions...');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const language = searchParams.get('language') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Special parameter to fetch all terms without pagination
    const fetchAll = searchParams.get('fetchAll') === 'true';

    console.log('📊 Request parameters:', {
      page, limit, search, status, language, sortBy, sortOrder, fetchAll
    });

    // For now, return the mock data that matches your API response
    const mockTerms = [
      {
        id: 1,
        title: "Terms and Conditions for ThinkCyber Platform",
        content: "These terms and conditions outline the rules and regulations for the use of ThinkCyber Website, located us",
        version: "1.0",
        language: "en",
        status: "Active",
        effectiveDate: "2025-07-31",
        createdAt: "2025-08-01T06:20:22.524Z",
        updatedAt: "2025-08-01T06:30:06.097Z",
        createdBy: "admin",
        updatedBy: "admin"
      }
    ];

    // Filter by status if specified
    let filteredTerms = mockTerms;
    if (status !== 'all') {
      filteredTerms = mockTerms.filter(term => term.status === status);
    }

    // Filter by search if specified
    if (search) {
      filteredTerms = filteredTerms.filter(term => 
        term.title.toLowerCase().includes(search.toLowerCase()) ||
        term.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    const meta = {
      total: filteredTerms.length,
      page: fetchAll ? 1 : page,
      limit: fetchAll ? filteredTerms.length : limit,
      totalPages: fetchAll ? 1 : Math.ceil(filteredTerms.length / limit),
      hasNext: false,
      hasPrev: false
    };

    // Calculate stats
    const stats = {
      total: mockTerms.length,
      draft: mockTerms.filter(term => term.status === 'Draft').length,
      published: mockTerms.filter(term => term.status === 'Published' || term.status === 'Active').length,
      archived: mockTerms.filter(term => term.status === 'Archived').length,
      languages: new Set(mockTerms.map(term => term.language)).size,
      latestVersion: mockTerms.length > 0 ? Math.max(...mockTerms.map(term => parseFloat(term.version) || 1.0)).toFixed(1) : '1.0',
    };

    return NextResponse.json({
      success: true,
      data: filteredTerms,
      meta,
      stats,
      message: `Fetched ${filteredTerms.length} terms and conditions`,
    });

  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new terms and conditions
export async function POST(request: NextRequest) {
  try {
    const body: CreateTermsRequest = await request.json();

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

    // Validate version format (should be like 1.0, 2.1, etc.)
    const versionRegex = /^\d+\.\d+$/;
    if (!versionRegex.test(body.version)) {
      return NextResponse.json(
        { success: false, error: 'Version must be in format X.Y (e.g., 1.0, 2.1)' },
        { status: 400 }
      );
    }

    // Validate language code (ISO 639-1)
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
    if (!validLanguages.includes(body.language.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid language code. Supported: ' + validLanguages.join(', ') },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await apiService.post<any>(API_ENDPOINTS.TERMS.BASE, {
      title: body.title.trim(),
      content: body.content.trim(),
      version: body.version,
      language: body.language.toLowerCase(),
      status: body.status,
      effective_date: body.effectiveDate || null,
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create terms and conditions' },
        { status: response.error?.includes('already exists') ? 409 : 500 }
      );
    }

    // Transform snake_case to camelCase
    const terms = response.data ? transformTermsData(response.data) : null;

    return NextResponse.json({
      success: true,
      message: 'Terms and conditions created successfully',
      data: terms
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating terms and conditions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
