// Topic-related type definitions

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string; // in minutes
  videoFile?: File | null;
  videoUrl: string;
  thumbnail: string;
  order: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id?: string;
  title: string;
  slug: string;
  emoji: string;
  category: string;
  subcategory: string;
  categoryName?: string; // Display name for category
  subcategoryName?: string; // Display name for subcategory
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string; // total duration in hours
  description: string;
  learningObjectives: string;
  modules: Module[];
  isFree: boolean;
  price: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  targetAudience: string[];
  prerequisites: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  isActive?: boolean;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TopicFormData extends Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'enrollmentCount' | 'rating' | 'reviewCount'> {}

export interface CreateTopicRequest extends TopicFormData {}

export interface UpdateTopicRequest extends Partial<TopicFormData> {
  id: string;
}

export interface TopicListItem {
  id: string;
  title: string;
  slug: string;
  emoji: string;
  category: string;
  subcategory: string;
  categoryName?: string; // Display name for category
  subcategoryName?: string; // Display name for subcategory
  difficulty: string;
  duration: string;
  status: string;
  featured: boolean;
  isFree: boolean;
  price: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicFilters {
  category?: string;
  subcategory?: string;
  difficulty?: string;
  status?: string;
  featured?: boolean;
  isFree?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'enrollmentCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TopicStats {
  totalTopics: number;
  publishedTopics: number;
  draftTopics: number;
  featuredTopics: number;
  freeTopics: number;
  paidTopics: number;
  totalEnrollments: number;
  averageRating: number;
}

// Video upload related types
export interface VideoUploadProgress {
  videoId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface VideoUploadResponse {
  success: boolean;
  data?: {
    videoId: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: string;
  };
  error?: string;
}

// Bulk operations
export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updates: Partial<Pick<Topic, 'status' | 'featured' | 'category' | 'subcategory' | 'tags'>>;
}

// Topic validation schemas (can be used with zod or similar)
export interface TopicValidationErrors {
  title?: string[];
  slug?: string[];
  category?: string[];
  difficulty?: string[];
  duration?: string[];
  description?: string[];
  learningObjectives?: string[];
  modules?: string[];
  price?: string[];
  metaTitle?: string[];
  metaDescription?: string[];
  general?: string[];
}
