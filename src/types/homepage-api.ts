// Types for Homepage API requests and responses

// ============= REQUEST TYPES =============

export interface HeroSectionRequest {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface AboutSectionRequest {
  title: string;
  content: string;
  image?: string;
  features?: string[];
}

export interface ContactInfoRequest {
  email: string;
  phone: string;
  address: string;
  hours: string;
  description: string;
  supportEmail: string;
  salesEmail: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface FAQRequest {
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
  language?: string;
}

export interface UpdateFAQRequest extends FAQRequest {
  id: string;
}

export interface HomepageContentRequest {
  language: string;
  hero: HeroSectionRequest;
  about: AboutSectionRequest;
  contact: ContactInfoRequest;
  faqs?: FAQRequest[];
}

// ============= RESPONSE TYPES =============

export interface HeroSectionResponse {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AboutSectionResponse {
  id: string;
  title: string;
  content: string;
  image?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfoResponse {
  id: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  description: string;
  supportEmail: string;
  salesEmail: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FAQResponse {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageContentResponse {
  id: string;
  language: string;
  hero: HeroSectionResponse;
  about: AboutSectionResponse;
  contact: ContactInfoResponse;
  faqs: FAQResponse[];
  isPublished: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ============= API RESPONSE WRAPPERS =============

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============= SPECIFIC API RESPONSES =============

// GET /homepage/{language}
export type GetHomepageResponse = ApiResponse<HomepageContentResponse>;

// POST /homepage/{language}
export type CreateHomepageResponse = ApiResponse<HomepageContentResponse>;

// PUT /homepage/{language}
export type UpdateHomepageResponse = ApiResponse<HomepageContentResponse>;

// DELETE /homepage/{language}
export type DeleteHomepageResponse = ApiResponse<{ deleted: boolean }>;

// GET /homepage/faqs
export type GetFAQsResponse = ApiResponse<FAQResponse[]>;

// POST /homepage/faqs
export type CreateFAQResponse = ApiResponse<FAQResponse>;

// PUT /homepage/faqs/{id}
export type UpdateFAQResponse = ApiResponse<FAQResponse>;

// DELETE /homepage/faqs/{id}
export type DeleteFAQResponse = ApiResponse<{ deleted: boolean }>;

// ============= BULK OPERATIONS =============

export interface BulkFAQRequest {
  faqs: FAQRequest[];
}

export interface BulkFAQResponse {
  created: FAQResponse[];
  updated: FAQResponse[];
  deleted: string[];
  errors: Array<{ index: number; error: string }>;
}

export type BulkFAQApiResponse = ApiResponse<BulkFAQResponse>;

// ============= VALIDATION TYPES =============

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  errors: Record<string, string[]>;
  validationErrors: ValidationError[];
}
