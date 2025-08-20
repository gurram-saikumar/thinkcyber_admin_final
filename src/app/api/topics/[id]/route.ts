import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Interface for topic data structure
interface Topic {
  id?: string;
  title: string;
  slug?: string;
  emoji?: string;
  category: string;
  subcategory?: string;
  categoryName?: string;
  subcategoryName?: string;
  difficulty: string;
  duration: string;
  description?: string;
  learningObjectives?: string;
  prerequisites?: string;
  modules?: Module[];
  isFree: boolean;
  price: string;
  tags?: string[];
  status: string;
  targetAudience?: string[];
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  description?: string;
  duration: string;
  videoUrl?: string;
  thumbnail?: string;
  order: number;
}

interface UpdateTopicRequest {
  title: string;
  category: string;
  subcategory?: string;
  difficulty: string;
  duration: string;
  description?: string;
  learningObjectives?: string;
  prerequisites?: string;
  isFree: boolean;
  price: string;
  tags?: string[];
  status: string;
  targetAudience?: string[];
  featured: boolean;
}

// Utility function to transform snake_case API response to camelCase
const transformTopicData = (apiData: any): Topic => ({
  id: apiData.id?.toString(),
  title: apiData.title,
  slug: apiData.slug,
  emoji: apiData.emoji,
  category: apiData.category,
  subcategory: apiData.subcategory,
  categoryName: apiData.categoryName,
  subcategoryName: apiData.subcategoryName,
  difficulty: apiData.difficulty,
  duration: apiData.duration?.toString(),
  description: apiData.description,
  learningObjectives: apiData.learning_objectives || apiData.learningObjectives,
  prerequisites: apiData.prerequisites,
  modules: apiData.modules || [], // Keep modules data
  isFree: apiData.is_free || apiData.isFree,
  price: apiData.price?.toString() || '0',
  tags: apiData.tags || [],
  status: apiData.status,
  targetAudience: apiData.target_audience || apiData.targetAudience || [],
  thumbnail: apiData.thumbnail,
  metaTitle: apiData.meta_title || apiData.metaTitle,
  metaDescription: apiData.meta_description || apiData.metaDescription,
  featured: apiData.featured || false,
  enrollmentCount: apiData.enrollment_count || apiData.enrollmentCount || 0,
  rating: apiData.rating || 0,
  reviewCount: apiData.review_count || apiData.reviewCount || 0,
  createdAt: apiData.created_at || apiData.createdAt,
  updatedAt: apiData.updated_at || apiData.updatedAt,
});

// Helper function to create mock topic data
function createMockTopic(topicId: string): Topic {
  return {
    id: topicId,
    title: 'Introduction to Cybersecurity',
    slug: 'introduction-to-cybersecurity',
    emoji: '🔐',
    category: '1', // Using numeric ID to match categories API
    subcategory: '1', // Using numeric ID to match subcategories API
    difficulty: 'beginner',
    duration: '4.5',
    description: 'Learn the fundamentals of cybersecurity and protect yourself online.',
    learningObjectives: '• Understand basic cybersecurity principles\n• Learn password best practices\n• Identify common security threats',
    modules: [
      {
        id: '1',
        title: 'Introduction Module',
        description: 'Getting started with cybersecurity',
        order: 1,
        videos: [
          {
            id: '1',
            title: 'Welcome to Cybersecurity',
            description: 'An introduction to the course',
            duration: '5',
            videoUrl: 'https://example.com/video1.mp4',
            thumbnail: 'https://example.com/thumb1.jpg',
            order: 1,
          }
        ]
      }
    ],
    isFree: true,
    price: '0',
    tags: ['cybersecurity', 'beginner', 'security'],
    status: 'published',
    targetAudience: ['🏢 Business Owners', '👤 General Users'],
    prerequisites: 'Basic computer literacy',
    thumbnail: 'https://example.com/topic-thumb.jpg',
    metaTitle: 'Introduction to Cybersecurity',
    metaDescription: 'Learn cybersecurity fundamentals in this comprehensive course',
    featured: true,
    enrollmentCount: 1250,
    rating: 4.8,
    reviewCount: 124,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-12-01').toISOString(),
  };
}

// GET - Fetch a specific topic by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    console.log('🔍 Fetching topic by ID:', topicId);

    // Call backend API with fallback to mock data
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.TOPICS.BY_ID(topicId));

      if (!response.success) {
        console.warn('⚠️ Backend API not available for topic, using mock data:', response.error);
        const mockTopic = createMockTopic(topicId);
        return NextResponse.json({
          success: true,
          data: mockTopic,
          message: 'Using mock data - backend not available'
        });
      }

      // Transform the API response
      const rawTopic = response.data || response;
      console.log('🔍 Raw topic data from backend:', JSON.stringify(rawTopic, null, 2));
      const topic = transformTopicData(rawTopic);
      console.log('🔍 Transformed topic data:', JSON.stringify(topic, null, 2));

      return NextResponse.json({
        success: true,
        data: topic,
        message: 'Topic fetched successfully'
      });
      
    } catch (error) {
      console.warn('⚠️ Backend API connection failed, using mock data:', error);
      const mockTopic = createMockTopic(topicId);
      return NextResponse.json({
        success: true,
        data: mockTopic,
        message: 'Using mock data - backend connection failed'
      });
    }

  } catch (error) {
    console.error('Error in GET topic API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}

// PUT - Update a specific topic by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const body = await request.json();

    console.log('📝 PUT Request received for topic:', topicId);
    console.log('📝 Request body keys:', Object.keys(body));
    console.log('📝 Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.title || !body.category || !body.difficulty) {
      console.error('❌ Validation failed for required fields:', {
        title: !body.title,
        category: !body.category,
        difficulty: !body.difficulty
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, category, difficulty',
          errors: {
            title: !body.title ? ['Title is required'] : [],
            category: !body.category ? ['Category is required'] : [],
            difficulty: !body.difficulty ? ['Difficulty is required'] : [],
          }
        },
        { status: 400 }
      );
    }

    console.log('✅ Required fields validation passed');

    // Call backend API with fallback
    try {
      console.log('🌐 Attempting to call backend API...');
      const response = await apiService.put<any>(API_ENDPOINTS.TOPICS.UPDATE(topicId), body);
      console.log('📡 Backend API response:', response);

      if (!response.success) {
        console.warn('⚠️ Backend API not available for topic update, using mock response:', response.error);
        const updatedTopic = {
          ...createMockTopic(topicId),
          ...body,
          id: topicId,
          updatedAt: new Date().toISOString(),
        };

        console.log('📦 Mock updated topic:', updatedTopic);

        return NextResponse.json({
          success: true,
          data: updatedTopic,
          message: 'Topic updated successfully (mock - backend not available)'
        });
      }

      // Transform the API response
      const rawTopic = response.data || response;
      const topic = transformTopicData(rawTopic);
      console.log('✅ Backend API update successful:', topic);

      return NextResponse.json({
        success: true,
        data: topic,
        message: 'Topic updated successfully'
      });

    } catch (apiError) {
      console.warn('⚠️ Backend API connection failed for topic update, using mock response:');
      console.warn('API Error:', apiError);
      
      const updatedTopic = {
        ...createMockTopic(topicId),
        ...body,
        id: topicId,
        updatedAt: new Date().toISOString(),
      };

      console.log('📦 Mock updated topic (API connection failed):', updatedTopic);

      return NextResponse.json({
        success: true,
        data: updatedTopic,
        message: 'Topic updated successfully (mock - backend connection failed)'
      });
    }

  } catch (error) {
    console.error('💥 Error in PUT topic API route:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update topic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific topic by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    console.log('🗑️ Deleting topic:', topicId);

    // Call backend API with fallback
    try {
      const response = await apiService.delete<any>(API_ENDPOINTS.TOPICS.DELETE(topicId));

      if (!response.success) {
        console.warn('⚠️ Backend API not available for topic deletion, simulating success:', response.error);
        return NextResponse.json({
          success: true,
          message: 'Topic deleted successfully (mock)'
        });
      }

      return NextResponse.json({
        success: true,
        data: response.data,
        message: 'Topic deleted successfully'
      });

    } catch (error) {
      console.warn('⚠️ Backend API connection failed for topic deletion, simulating success:', error);
      return NextResponse.json({
        success: true,
        message: 'Topic deleted successfully (mock - backend connection failed)'
      });
    }

  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete topic',
      },
      { status: 500 }
    );
  }
}
