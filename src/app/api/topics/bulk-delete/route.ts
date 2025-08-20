import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing topic IDs',
        },
        { status: 400 }
      );
    }

    // Mock bulk deletion - in a real app, delete from database
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `${ids.length} topic(s) deleted successfully`,
      data: {
        deletedCount: ids.length,
        deletedIds: ids,
      },
    });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete topics',
      },
      { status: 500 }
    );
  }
}
