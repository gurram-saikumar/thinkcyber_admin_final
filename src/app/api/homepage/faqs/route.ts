import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// POST - Create a new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Add default language if not provided
    const faqData = {
      ...body,
      language: body.language || 'en'
    };

    // Call backend API using apiService
    const response = await apiService.post(API_ENDPOINTS.HOMEPAGE.FAQS, faqData);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to create FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ created successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
