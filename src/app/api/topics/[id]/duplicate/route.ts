import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock duplicate logic
    // In a real app, you would:
    // 1. Fetch the original topic from database
    // 2. Create a copy with modified title/slug
    // 3. Save to database
    
    const mockDuplicatedTopic = {
      id: `${id}_copy_${Date.now()}`,
      title: 'Sample Topic (Copy)',
      slug: `sample-topic-copy-${Date.now()}`,
      status: 'draft',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: mockDuplicatedTopic,
      message: 'Topic duplicated successfully',
    });
  } catch (error) {
    console.error('Duplicate Topic Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to duplicate topic',
      },
      { status: 500 }
    );
  }
}
