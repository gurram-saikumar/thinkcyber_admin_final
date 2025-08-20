import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiResponse } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Types
export interface Category {
  id?: number;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

export interface CategoriesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fetchAll?: boolean;
}

export interface CategoriesListResponse {
  categories: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    totalTopics: number;
  };
}

// Generic hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (data: any) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook to fetch all categories with optional filtering and pagination
 */
export const useCategories = (params: CategoriesListParams = {}) => {
  const [state, setState] = useState<UseApiState<CategoriesListResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const endpoint = buildApiUrlWithQuery(API_ENDPOINTS.CATEGORIES.BASE, params);
      const response = await apiService.get<CategoriesListResponse>(endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      
      setState({
        data: response.data!,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [params]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    refetch: fetchCategories,
  };
};

/**
 * Hook to fetch a single category by ID
 */
export const useCategory = (id: number) => {
  const [state, setState] = useState<UseApiState<Category>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCategory = useCallback(async () => {
    if (!id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.get<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch category');
      }
      
      setState({
        data: response.data!,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [id]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    ...state,
    refetch: fetchCategory,
  };
};

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const [state, setState] = useState<UseMutationState<Category>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async (data: CreateCategoryRequest): Promise<Category | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create category');
      }
      
      setState(prev => ({
        ...prev,
        data: response.data!,
        loading: false,
        error: null,
      }));
      
      return response.data!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      loading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

/**
 * Hook to update an existing category
 */
export const useUpdateCategory = () => {
  const [state, setState] = useState<UseMutationState<Category>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async ({ id, data }: { id: number; data: UpdateCategoryRequest }): Promise<Category | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.put<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update category');
      }
      
      setState(prev => ({
        ...prev,
        data: response.data!,
        loading: false,
        error: null,
      }));
      
      return response.data!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      loading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const [state, setState] = useState<UseMutationState<{ id: number; name?: string }>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async (id: number): Promise<{ id: number; name?: string } | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.delete<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete category');
      }
      
      const result = { id, name: response.data?.name };
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      loading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

/**
 * Hook to bulk delete categories
 */
export const useBulkDeleteCategories = () => {
  const [state, setState] = useState<UseMutationState<{ deletedCount: number }>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async (ids: number[]): Promise<{ deletedCount: number } | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.delete<{ deletedCount: number }>(
        API_ENDPOINTS.CATEGORIES.BULK_DELETE,
        {
          body: { ids },
        } as any
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete categories');
      }
      
      setState(prev => ({
        ...prev,
        data: response.data!,
        loading: false,
        error: null,
      }));
      
      return response.data!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      loading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

/**
 * Hook to search categories
 */
export const useSearchCategories = (searchTerm: string, enabled: boolean = true) => {
  const [state, setState] = useState<UseApiState<Category[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchCategories = useCallback(async () => {
    if (!enabled || searchTerm.length < 2) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const endpoint = buildApiUrlWithQuery(API_ENDPOINTS.CATEGORIES.SEARCH, { q: searchTerm });
      const response = await apiService.get<Category[]>(endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to search categories');
      }
      
      setState({
        data: response.data!,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [searchTerm, enabled]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCategories();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchCategories]);

  return {
    ...state,
    refetch: searchCategories,
  };
};
