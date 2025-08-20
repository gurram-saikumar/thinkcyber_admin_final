import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrlWithQuery } from '@/constants/api-endpoints';

// Types
export interface SubCategory {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  status: 'Active' | 'Draft' | 'Inactive';
  topicsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubCategoryRequest {
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
}

export interface UpdateSubCategoryRequest {
  name: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Draft' | 'Inactive';
}

export interface SubCategoriesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubCategoriesListResponse {
  subcategories: SubCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
 * Hook to fetch all subcategories with optional filtering and pagination
 */
export const useSubCategories = (params: SubCategoriesListParams = {}) => {
  const [state, setState] = useState<UseApiState<SubCategoriesListResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchSubCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const endpoint = buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.BASE, params);
      const response = await apiService.get<SubCategoriesListResponse>(endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subcategories');
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
    fetchSubCategories();
  }, [fetchSubCategories]);

  return {
    ...state,
    refetch: fetchSubCategories,
  };
};

/**
 * Hook to fetch subcategories by category ID
 */
export const useSubCategoriesByCategory = (categoryId: number) => {
  const [state, setState] = useState<UseApiState<SubCategory[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchSubCategories = useCallback(async () => {
    if (!categoryId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.get<SubCategory[]>(
        API_ENDPOINTS.SUBCATEGORIES.BY_CATEGORY(categoryId)
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subcategories');
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
  }, [categoryId]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  return {
    ...state,
    refetch: fetchSubCategories,
  };
};

/**
 * Hook to fetch a single subcategory by ID
 */
export const useSubCategory = (id: number) => {
  const [state, setState] = useState<UseApiState<SubCategory>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchSubCategory = useCallback(async () => {
    if (!id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.get<SubCategory>(API_ENDPOINTS.SUBCATEGORIES.BY_ID(id));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subcategory');
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
    fetchSubCategory();
  }, [fetchSubCategory]);

  return {
    ...state,
    refetch: fetchSubCategory,
  };
};

/**
 * Hook to create a new subcategory
 */
export const useCreateSubCategory = () => {
  const [state, setState] = useState<UseMutationState<SubCategory>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async (data: CreateSubCategoryRequest): Promise<SubCategory | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.post<SubCategory>(API_ENDPOINTS.SUBCATEGORIES.BASE, data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create subcategory');
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
 * Hook to update an existing subcategory
 */
export const useUpdateSubCategory = () => {
  const [state, setState] = useState<UseMutationState<SubCategory>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => null,
    reset: () => {},
  });

  const mutate = useCallback(async ({ id, data }: { id: number; data: UpdateSubCategoryRequest }): Promise<SubCategory | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.put<SubCategory>(API_ENDPOINTS.SUBCATEGORIES.BY_ID(id), data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update subcategory');
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
 * Hook to delete a subcategory
 */
export const useDeleteSubCategory = () => {
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
      
      const response = await apiService.delete<SubCategory>(API_ENDPOINTS.SUBCATEGORIES.BY_ID(id));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete subcategory');
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
 * Hook to bulk delete subcategories
 */
export const useBulkDeleteSubCategories = () => {
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
        API_ENDPOINTS.SUBCATEGORIES.BULK_DELETE,
        {
          body: { ids },
        } as any
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete subcategories');
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
 * Hook to search subcategories
 */
export const useSearchSubCategories = (searchTerm: string, enabled: boolean = true) => {
  const [state, setState] = useState<UseApiState<SubCategory[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchSubCategories = useCallback(async () => {
    if (!enabled || searchTerm.length < 2) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const endpoint = buildApiUrlWithQuery(API_ENDPOINTS.SUBCATEGORIES.SEARCH, { q: searchTerm });
      const response = await apiService.get<SubCategory[]>(endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to search subcategories');
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
      searchSubCategories();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchSubCategories]);

  return {
    ...state,
    refetch: searchSubCategories,
  };
};
