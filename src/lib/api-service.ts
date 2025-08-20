// API Service utility for making HTTP requests
import { buildUrl } from './utils';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  stats?: {
    total?: number;
    draft?: number;
    published?: number;
    archived?: number;
    languages?: number;
    latestVersion?: string;
    // Topics-specific stats
    totalTopics?: number;
    publishedTopics?: number;
    draftTopics?: number;
    featuredTopics?: number;
    freeTopics?: number;
    paidTopics?: number;
    totalEnrollments?: number;
    averageRating?: number;
  };
  categories?: any[];
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  params?: Record<string, string | number | boolean>;
}

class ApiService {
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async makeRequest<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Use buildUrl to construct the full URL with the external API base
      const url = buildUrl(endpoint, config.params);
      
      console.log('🔍 API Call Debug:');
      console.log('  Endpoint:', endpoint);
      console.log('  Full URL:', url);
      console.log('  Method:', config.method || 'GET');
      console.log('  Params:', config.params);
      
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...config.headers,
      };

      const requestConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
        cache: config.cache || 'no-store',
        next: config.next,
        // Increase timeout for file uploads, default timeout for other requests
        signal: AbortSignal.timeout(
          config.body instanceof FormData ? 300000 : 10000
        ), // 5 minutes for file uploads, 10 seconds for others
      };

      // Add body for non-GET requests
      if (config.body && config.method !== 'GET') {
        if (config.body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it with boundary)
          delete headers['Content-Type'];
          requestConfig.headers = headers;
          requestConfig.body = config.body;
        } else {
          requestConfig.body = JSON.stringify(config.body);
        }
      }

      const response = await fetch(url, requestConfig);
      
      console.log('📡 API Response status:', response.status);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || data?.message || `HTTP Error: ${response.status}`,
          data: data,
        };
      }

      return {
        success: true,
        data: data?.data || (Array.isArray(data) ? data : null),
        message: data?.message,
        meta: data?.meta,
        // Preserve additional properties like stats, categories, etc.
        ...(data?.stats && { stats: data.stats }),
        ...(data?.categories && { categories: data.categories }),
      };
    } catch (error) {
      console.error('API Request Error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  // GET request
  async get<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST request
  async post<T = any>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body });
  }

  // PUT request
  async put<T = any>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  // DELETE request
  async delete<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Deprecated methods - keeping for backward compatibility
  setBaseUrl(baseUrl: string): void {
    console.warn('setBaseUrl is deprecated. Base URL is now managed via NEXT_PUBLIC_API_BASE_URL environment variable and buildUrl function.');
  }

  // Update default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  // Add authorization header
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Remove authorization header
  removeAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for creating custom instances
export { ApiService };

// Helper function for handling API errors in components
export const handleApiError = (error: ApiResponse | Error): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if ('error' in error && error.error) {
    return error.error;
  }
  
  if ('errors' in error && error.errors) {
    // Handle validation errors
    const firstErrorKey = Object.keys(error.errors)[0];
    return error.errors[firstErrorKey]?.[0] || 'Validation error occurred';
  }
  
  return 'An unexpected error occurred';
};
