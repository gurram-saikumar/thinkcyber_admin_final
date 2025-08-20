import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// PUT - Update a specific FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqId = params.id;
    const body = await request.json();

    if (!faqId) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.question && !body.answer) {
      return NextResponse.json(
        { success: false, error: 'At least question or answer is required for update' },
        { status: 400 }
      );
    }

    // Add default language if not provided
    const faqData = {
      ...body,
      language: body.language || 'en'
    };

    // Call backend API using apiService
    const response = await apiService.put(API_ENDPOINTS.HOMEPAGE.FAQ_BY_ID(faqId), faqData);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to update FAQ' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ updated successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqId = params.id;

    if (!faqId) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ ID' },
        { status: 400 }
      );
    }

    // Call backend API using apiService
    const response = await apiService.delete(API_ENDPOINTS.HOMEPAGE.FAQ_BY_ID(faqId));

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to delete FAQ' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
