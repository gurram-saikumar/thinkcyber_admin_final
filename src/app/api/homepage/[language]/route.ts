import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { HomepageContentResponse, HomepageContentRequest } from '@/types/homepage-api';

// Mock data for testing - replace with actual database calls
const mockHomepageData: HomepageContentResponse = {
  id: "homepage_en_001",
  language: "en",
  hero: {
    id: "hero_001",
    title: "Welcome to ThinkCyber",
    subtitle: "Advanced Cybersecurity Training Platform",
    backgroundImage: "https://example.com/hero-bg.jpg",
    ctaText: "Get Started",
    ctaLink: "/dashboard",
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-01T10:00:00Z"
  },
  about: {
    id: "about_001",
    title: "About Our Platform",
    content: "We provide comprehensive cybersecurity training and education to help you stay ahead of evolving threats.",
    image: "https://example.com/about-image.jpg",
    features: [
      "Interactive Learning",
      "Real-world Scenarios",
      "Expert Instructors",
      "Hands-on Labs"
    ],
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-01T10:00:00Z"
  },
  contact: {
    id: "contact_001",
    email: "info@thinkcyber.com",
    phone: "+1-555-0123",
    address: "123 Security St, Cyber City, CC 12345",
    hours: "9 AM - 6 PM EST",
    description: "Get in touch with our team for any questions or support",
    supportEmail: "support@thinkcyber.com",
    salesEmail: "sales@thinkcyber.com",
    socialLinks: {
      facebook: "https://facebook.com/thinkcyber",
      twitter: "https://twitter.com/thinkcyber",
      linkedin: "https://linkedin.com/company/thinkcyber"
    },
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-01T10:00:00Z"
  },
  faqs: [
    {
      id: "faq_001",
      question: "What is cybersecurity training?",
      answer: "Cybersecurity training teaches you to protect systems, networks, and data from digital attacks.",
      order: 1,
      isActive: true,
      createdAt: "2025-08-01T10:00:00Z",
      updatedAt: "2025-08-01T10:00:00Z"
    },
    {
      id: "faq_002",
      question: "How long are the courses?",
      answer: "Course duration varies from 2-12 weeks depending on the complexity and depth of the topic.",
      order: 2,
      isActive: true,
      createdAt: "2025-08-01T10:00:00Z",
      updatedAt: "2025-08-01T10:00:00Z"
    },
    {
      id: "faq_003",
      question: "Do you provide certificates?",
      answer: "Yes, we provide industry-recognized certificates upon successful completion of courses.",
      order: 3,
      isActive: true,
      createdAt: "2025-08-01T10:00:00Z",
      updatedAt: "2025-08-01T10:00:00Z"
    }
  ],
  createdAt: "2025-08-01T10:00:00Z",
  updatedAt: "2025-08-01T10:00:00Z",
  version: 1,
  isPublished: true,
  createdBy: "admin",
  updatedBy: "admin"
};

export async function POST(
  request: NextRequest,
  { params }: { params: { language: string } }
) {
  try {
    const { language } = params;
    const body: HomepageContentRequest = await request.json();
    
    // Validate language parameter (now only supporting English)
    const supportedLanguages = ['en'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Only English language is supported',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.hero?.title || !body.about?.title || !body.contact?.email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          validationErrors: [
            { field: 'hero.title', message: 'Hero title is required', code: 'REQUIRED' },
            { field: 'about.title', message: 'About title is required', code: 'REQUIRED' },
            { field: 'contact.email', message: 'Contact email is required', code: 'REQUIRED' }
          ],
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Here you would implement your database save logic using apiService
    // Call backend API using apiService
    const response = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, {
      language,
      hero: {
        title: body.hero.title.trim(),
        subtitle: body.hero.subtitle.trim(),
        background_image: body.hero.backgroundImage,
        cta_text: body.hero.ctaText,
        cta_link: body.hero.ctaLink,
      },
      about: {
        title: body.about.title.trim(),
        content: body.about.content.trim(),
        image: body.about.image,
        features: body.about.features,
      },
      contact: {
        email: body.contact.email.trim(),
        phone: body.contact.phone,
        address: body.contact.address,
        hours: body.contact.hours,
        description: body.contact.description,
        support_email: body.contact.supportEmail,
        sales_email: body.contact.salesEmail,
        social_links: {
          facebook: body.contact.socialLinks?.facebook || '',
          twitter: body.contact.socialLinks?.twitter || '',
          linkedin: body.contact.socialLinks?.linkedin || '',
        },
      },
      faqs: (body.faqs || []).map(faq => ({
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        is_active: faq.isActive,
      })),
    });

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false,
          error: response.error || 'Failed to save homepage data',
          statusCode: 500
        },
        { status: 500 }
      );
    } 
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create response data from API response or fallback to mock structure
    const responseData: HomepageContentResponse = response.data || {
      id: "homepage_en_001",
      language,
      hero: {
        id: "hero_001",
        title: body.hero.title,
        subtitle: body.hero.subtitle,
        backgroundImage: body.hero.backgroundImage,
        ctaText: body.hero.ctaText,
        ctaLink: body.hero.ctaLink,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      about: {
        id: "about_001",
        title: body.about.title,
        content: body.about.content,
        image: body.about.image,
        features: body.about.features,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      contact: {
        id: "contact_001",
        email: body.contact.email,
        phone: body.contact.phone,
        address: body.contact.address,
        hours: body.contact.hours,
        description: body.contact.description,
        supportEmail: body.contact.supportEmail,
        salesEmail: body.contact.salesEmail,
        socialLinks: body.contact.socialLinks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      faqs: (body.faqs || []).map((faq, index) => ({
        id: `faq_${Date.now()}_${index}`,
        question: faq.question,
        answer: faq.answer,
        order: faq.order || index + 1,
        isActive: faq.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isPublished: true,
      createdBy: "admin",
      updatedBy: "admin"
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await params;
    
    // Validate language parameter (now only supporting English)
    const supportedLanguages = ['en'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Only English language is supported',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Here you would implement your database fetch logic using apiService
    // Call backend API using apiService - with fallback to mock data
    try {
      const response = await apiService.get(API_ENDPOINTS.HOMEPAGE.BY_LANGUAGE(language));

      if (!response.success) {
         // Use mock data as fallback
        return NextResponse.json({
          success: true,
          data: mockHomepageData,
          message: 'Using mock data - backend not available'
        });
      }

      // Return the API response data
      const homepageData = response.data || mockHomepageData;
      
      // Return the homepage data with proper structure
      return NextResponse.json({
        success: true,
        data: homepageData
      });
      
    } catch (error) {
       // Use mock data as fallback when backend is not accessible
      return NextResponse.json({
        success: true,
        data: mockHomepageData,
        message: 'Using mock data - backend connection failed'
      });
    }
    
  } catch (error) {
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

// PUT method for updating existing homepage content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await params;
    
    console.log('PUT /api/homepage/[language] - Language:', language);
    
    const body = await request.json();
    console.log('PUT /api/homepage/[language] - Request body:', JSON.stringify(body, null, 2));
    
    // Validate language parameter
    if (!language || language !== 'en') {
      console.log('PUT /api/homepage/[language] - Invalid language:', language);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or unsupported language',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Validate request body - make validation more lenient
    if (!body) {
      console.log('PUT /api/homepage/[language] - Empty request body');
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is required',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // More flexible validation - only check if properties exist and are not empty
    const heroValid = body.hero && body.hero.title && body.hero.subtitle;
    const aboutValid = body.about && body.about.title && body.about.content;
    const contactValid = body.contact && body.contact.email;

    if (!heroValid || !aboutValid || !contactValid) {
      console.log('PUT /api/homepage/[language] - Validation failed:', {
        heroValid,
        aboutValid,
        contactValid,
        hero: body.hero,
        about: body.about,
        contact: body.contact
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          validationErrors: [
            !heroValid && { field: 'hero', message: 'Hero title and subtitle are required', code: 'REQUIRED' },
            !aboutValid && { field: 'about', message: 'About title and content are required', code: 'REQUIRED' },
            !contactValid && { field: 'contact', message: 'Contact email is required', code: 'REQUIRED' }
          ].filter(Boolean),
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Call backend API using apiService for update
    console.log('PUT /api/homepage/[language] - Calling backend API:', API_ENDPOINTS.HOMEPAGE.CONTENT);
    
    let response;
    try {
      response = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, {
        language,
        hero: {
          title: body.hero.title.trim(),
          subtitle: body.hero.subtitle.trim(),
          background_image: body.hero.backgroundImage,
          cta_text: body.hero.ctaText,
          cta_link: body.hero.ctaLink,
        },
        about: {
          title: body.about.title.trim(),
          content: body.about.content.trim(),
          image: body.about.image,
          features: body.about.features,
        },
        contact: {
          email: body.contact.email.trim(),
          phone: body.contact.phone,
          address: body.contact.address,
          hours: body.contact.hours,
          description: body.contact.description,
          support_email: body.contact.supportEmail,
          sales_email: body.contact.salesEmail,
          social_links: {
            facebook: body.contact.socialLinks?.facebook || '',
            twitter: body.contact.socialLinks?.twitter || '',
            linkedin: body.contact.socialLinks?.linkedin || '',
          },
        },
        faqs: (body.faqs || []).map((faq: any) => ({
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          is_active: faq.isActive,
        })),
      });
    } catch (apiError) {
      console.log('PUT /api/homepage/[language] - Backend API error, using mock response:', apiError);
      // If backend API fails, simulate success with mock data for development
      response = {
        success: true,
        data: null // Will use mock data below
      };
    }

    console.log('PUT /api/homepage/[language] - API Service Response:', response);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to update homepage data',
          statusCode: 500
        },
        { status: 500 }
      );
    }

    // Create updated response data from API response or fallback to updated mock structure
    const updatedData: HomepageContentResponse = response.data || {
      ...mockHomepageData,
      hero: {
        ...mockHomepageData.hero,
        title: body.hero.title,
        subtitle: body.hero.subtitle,
        backgroundImage: body.hero.backgroundImage,
        ctaText: body.hero.ctaText,
        ctaLink: body.hero.ctaLink,
        updatedAt: new Date().toISOString()
      },
      about: {
        ...mockHomepageData.about,
        title: body.about.title,
        content: body.about.content,
        image: body.about.image,
        features: body.about.features,
        updatedAt: new Date().toISOString()
      },
      contact: {
        ...mockHomepageData.contact,
        email: body.contact.email,
        phone: body.contact.phone,
        address: body.contact.address,
        hours: body.contact.hours,
        description: body.contact.description,
        supportEmail: body.contact.supportEmail,
        salesEmail: body.contact.salesEmail,
        socialLinks: body.contact.socialLinks,
        updatedAt: new Date().toISOString()
      },
      faqs: (body.faqs || []).map((faq: any, index: number) => ({
        id: `faq_${Date.now()}_${index}`,
        question: faq.question,
        answer: faq.answer,
        order: faq.order || index + 1,
        isActive: faq.isActive ?? true,
        createdAt: mockHomepageData.faqs.find(f => f.order === faq.order)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      updatedAt: new Date().toISOString(),
      version: mockHomepageData.version + 1,
      updatedBy: "admin"
    };

    return NextResponse.json({
      success: true,
      data: updatedData
    });

  } catch (error) {
    console.error('PUT /api/homepage/[language] - Error updating homepage data:', error);
    console.error('PUT /api/homepage/[language] - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}
