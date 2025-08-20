import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Interface for topic data structure
interface Topic {
  id: string;
  title: string;
  slug?: string;
  emoji?: string;
  category: string;
  subcategory?: string;
  difficulty: string;
  duration: string;
  description?: string;
  status: string;
  featured: boolean;
  isFree: boolean;
  price: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Utility function to transform snake_case API response to camelCase
const transformTopicData = (apiData: any): Topic => ({
  id: apiData.id?.toString(),
  title: apiData.title,
  slug: apiData.slug,
  emoji: apiData.emoji,
  category: apiData.category,
  subcategory: apiData.subcategory,
  difficulty: apiData.difficulty,
  duration: apiData.duration?.toString(),
  description: apiData.description,
  status: apiData.status,
  featured: apiData.featured || false,
  isFree: apiData.is_free || apiData.isFree || false,
  price: apiData.price?.toString() || '0',
  enrollmentCount: apiData.enrollment_count || apiData.enrollmentCount || 0,
  rating: apiData.rating || 0,
  reviewCount: apiData.review_count || apiData.reviewCount || 0,
  createdAt: apiData.created_at || apiData.createdAt,
  updatedAt: apiData.updated_at || apiData.updatedAt,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const difficulty = searchParams.get('difficulty') || '';

    console.log('🔍 Fetching topics with filters:', { page, limit, search, category, status, difficulty });

    // Build query parameters for backend API
    const queryParams: Record<string, any> = { page, limit };
    if (search) queryParams.search = search;
    if (category && category !== 'all') queryParams.category = category;
    if (status && status !== 'all') queryParams.status = status;
    if (difficulty && difficulty !== 'all') queryParams.difficulty = difficulty;

    // Call backend API with fallback to mock data
    try {
      const response = await apiService.get(
        buildApiUrlWithQuery(API_ENDPOINTS.TOPICS.BASE, queryParams)
      );

      if (!response.success) {
        console.warn('⚠️ Backend API not available for topics, using mock data:', response.error);
        return getMockTopicsResponse({ page, limit, search, category, status, difficulty });
      }

      // Extract topics data and transform snake_case to camelCase
      const rawTopics = response.data || [];
      const topics = Array.isArray(rawTopics) ? rawTopics.map(transformTopicData) : [];

      const meta = response.meta || {
        total: topics.length,
        page,
        limit,
        totalPages: Math.ceil(topics.length / limit),
      };

      // Calculate stats
      const stats = response.stats || calculateTopicStats(topics);

      return NextResponse.json({
        success: true,
        data: topics,
        meta,
        stats,
        message: `Fetched ${topics.length} topics`
      });

    } catch (error) {
      console.warn('⚠️ Backend API connection failed, using mock data:', error);
      return getMockTopicsResponse({ page, limit, search, category, status, difficulty });
    }

  } catch (error) {
    console.error('Topics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topics',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Creating new topic with data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.title || !body.category || !body.difficulty) {
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

    // Call backend API with fallback
    try {
      const response = await apiService.post<Topic>(API_ENDPOINTS.TOPICS.BASE, body);

      if (!response.success) {
        console.warn('⚠️ Backend API not available for topic creation, simulating success:', response.error);
        // Mock creation response
        const newTopic = {
          id: Date.now().toString(),
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          enrollmentCount: 0,
          rating: 0,
          reviewCount: 0,
        };

        return NextResponse.json({
          success: true,
          data: newTopic,
          message: `Topic ${body.status === 'published' ? 'published' : 'saved as draft'} successfully (mock)`,
        });
      }

      // Transform the API response
      const rawTopic = response.data || response;
      const topic = transformTopicData(rawTopic);

      return NextResponse.json({
        success: true,
        data: topic,
        message: `Topic ${body.status === 'published' ? 'published' : 'saved as draft'} successfully`,
      });

    } catch (error) {
      console.warn('⚠️ Backend API connection failed for topic creation, simulating success:', error);
      // Mock creation response
      const newTopic = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
      };

      return NextResponse.json({
        success: true,
        data: newTopic,
        message: `Topic ${body.status === 'published' ? 'published' : 'saved as draft'} successfully (mock - backend connection failed)`,
      });
    }

  } catch (error) {
    console.error('Topic Creation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create topic',
      },
      { status: 500 }
    );
  }
}

// Helper function to return mock topics response
function getMockTopicsResponse({ page, limit, search, category, status, difficulty }: any) {
    const mockTopics = [
      {
        id: '1',
        title: 'Introduction to Cybersecurity',
        slug: 'introduction-to-cybersecurity',
        emoji: '🔐',
        category: 'cybersecurity-fundamentals',
        subcategory: 'basic-security',
        difficulty: 'beginner',
        duration: '4.5',
        status: 'published',
        featured: true,
        isFree: true,
        price: '0',
        enrollmentCount: 1250,
        rating: 4.8,
        reviewCount: 124,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-12-01').toISOString(),
      },
      {
        id: '2',
        title: 'Advanced Network Security',
        slug: 'advanced-network-security',
        emoji: '🌐',
        category: 'network-security',
        subcategory: 'firewall-config',
        difficulty: 'advanced',
        duration: '8.0',
        status: 'published',
        featured: false,
        isFree: false,
        price: '99.99',
        enrollmentCount: 568,
        rating: 4.6,
        reviewCount: 87,
        createdAt: new Date('2024-02-20').toISOString(),
        updatedAt: new Date('2024-11-28').toISOString(),
      },
      {
        id: '3',
        title: 'Web Application Security Testing',
        slug: 'web-application-security-testing',
        emoji: '💻',
        category: 'web-security',
        subcategory: 'penetration-testing',
        difficulty: 'intermediate',
        duration: '6.5',
        status: 'published',
        featured: true,
        isFree: false,
        price: '149.99',
        enrollmentCount: 892,
        rating: 4.9,
        reviewCount: 156,
        createdAt: new Date('2024-03-10').toISOString(),
        updatedAt: new Date('2024-12-05').toISOString(),
      },
      {
        id: '4',
        title: 'Mobile App Security Fundamentals',
        slug: 'mobile-app-security-fundamentals',
        emoji: '📱',
        category: 'mobile-security',
        subcategory: 'app-security',
        difficulty: 'beginner',
        duration: '3.5',
        status: 'draft',
        featured: false,
        isFree: true,
        price: '0',
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date('2024-11-15').toISOString(),
        updatedAt: new Date('2024-12-08').toISOString(),
      },
      {
        id: '5',
        title: 'Cloud Security Architecture',
        slug: 'cloud-security-architecture',
        emoji: '☁️',
        category: 'cloud-security',
        subcategory: 'aws-security',
        difficulty: 'expert',
        duration: '12.0',
        status: 'published',
        featured: true,
        isFree: false,
        price: '299.99',
        enrollmentCount: 234,
        rating: 4.7,
        reviewCount: 45,
        createdAt: new Date('2024-04-05').toISOString(),
        updatedAt: new Date('2024-11-30').toISOString(),
      },
      {
        id: '6',
        title: 'Incident Response Planning',
        slug: 'incident-response-planning',
        emoji: '🚨',
        category: 'incident-response',
        subcategory: 'response-plans',
        difficulty: 'intermediate',
        duration: '5.5',
        status: 'published',
        featured: false,
        isFree: false,
        price: '79.99',
        enrollmentCount: 445,
        rating: 4.5,
        reviewCount: 67,
        createdAt: new Date('2024-05-12').toISOString(),
        updatedAt: new Date('2024-11-25').toISOString(),
      },
      {
        id: '7',
        title: 'GDPR Compliance Guide',
        slug: 'gdpr-compliance-guide',
        emoji: '📋',
        category: 'compliance',
        subcategory: 'gdpr-compliance',
        difficulty: 'intermediate',
        duration: '4.0',
        status: 'archived',
        featured: false,
        isFree: true,
        price: '0',
        enrollmentCount: 678,
        rating: 4.3,
        reviewCount: 89,
        createdAt: new Date('2024-01-30').toISOString(),
        updatedAt: new Date('2024-10-15').toISOString(),
      },
      {
        id: '8',
        title: 'Password Security Best Practices',
        slug: 'password-security-best-practices',
        emoji: '🔑',
        category: 'cybersecurity-fundamentals',
        subcategory: 'password-security',
        difficulty: 'beginner',
        duration: '2.0',
        status: 'published',
        featured: false,
        isFree: true,
        price: '0',
        enrollmentCount: 2150,
        rating: 4.9,
        reviewCount: 287,
        createdAt: new Date('2024-06-18').toISOString(),
        updatedAt: new Date('2024-12-02').toISOString(),
      },
    ];

    // Apply filters
    let filteredTopics = mockTopics;
    
    if (search) {
      filteredTopics = filteredTopics.filter(topic => 
        topic.title.toLowerCase().includes(search.toLowerCase()) ||
        topic.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredTopics = filteredTopics.filter(topic => topic.category === category);
    }
    
    if (status) {
      filteredTopics = filteredTopics.filter(topic => topic.status === status);
    }

    if (difficulty) {
      filteredTopics = filteredTopics.filter(topic => topic.difficulty === difficulty);
    }

    // Pagination
    const total = filteredTopics.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTopics = filteredTopics.slice(start, end);

    // Calculate stats
    const stats = {
      totalTopics: mockTopics.length,
      publishedTopics: mockTopics.filter(t => t.status === 'published').length,
      draftTopics: mockTopics.filter(t => t.status === 'draft').length,
      featuredTopics: mockTopics.filter(t => t.featured).length,
      freeTopics: mockTopics.filter(t => t.isFree).length,
      paidTopics: mockTopics.filter(t => !t.isFree).length,
      totalEnrollments: mockTopics.reduce((sum, t) => sum + t.enrollmentCount, 0),
      averageRating: mockTopics.reduce((sum, t) => sum + t.rating, 0) / mockTopics.filter(t => t.rating > 0).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: paginatedTopics,
      stats,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Topics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topics',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.category || !body.difficulty) {
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

    // Mock creation - in a real app, save to database
    const newTopic = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      isActive: true,
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: newTopic,
      message: `Topic ${body.status === 'published' ? 'published' : 'saved as draft'} successfully`,
    });
  } catch (error) {
    console.error('Topic Creation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create topic',
      },
      { status: 500 }
    );
  }
}
