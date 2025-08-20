import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
// Privacy Policy interface (updated to remove language, defaults to English)
export interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  version: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Example hook implementation (fixes misplaced logic)
export function usePrivacyPolicies(filters?: any) {
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([]);
  const [stats, setStats] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      const params: any = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.status && filters.status !== 'all') params.status = filters.status;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

      try {
        const result = await apiService.get(API_ENDPOINTS.PRIVACY.BASE, { params });
        if (result.success && result.data) {
          setPrivacyPolicies(Array.isArray(result.data) ? result.data : [result.data]);
          setStats(result.data?.stats || {
            total: 0,
            draft: 0,
            published: 0,
            archived: 0,
            languages: 0,
            latestVersion: '1.0'
          });
        } else {
          setError(result.error || 'Failed to fetch privacy policies');
          toast.error('Failed to fetch privacy policies. Please try again.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch privacy policies');
        toast.error('Failed to fetch privacy policies. Please try again.');
      }
    };
    fetchPolicies();
  }, [filters]);

  return { privacyPolicies, stats, error };
}

// Privacy Policy interface (updated to remove language, defaults to English)
export interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  version: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// API response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    draft: number;
    published: number;
    archived: number;
    languages: number;
    latestVersion: string;
  };
}

interface PrivacyPoliciesResponse {
  success: boolean;
  data: PrivacyPolicy[];
  error?: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    draft: number;
    published: number;
    archived: number;
    latestVersion: string;
  };
}

// Create/Update privacy policy data
export interface CreatePrivacyData {
  title: string;
  content: string;
  version: string;
  status: 'Draft' | 'Published' | 'Archived';
  effectiveDate?: string;
}

// Hook for privacy policy operations
// ...existing code...

  // Fetch specific privacy policy by ID
  const fetchPrivacyPolicy = async (id: number): Promise<PrivacyPolicy | null> => {
    try {
      const response = await fetch(`/api/privacy/${id}`);
      const result: ApiResponse<PrivacyPolicy> = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        toast.error(result.error || 'Failed to fetch privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    }
  };

  // Create new privacy policy
  const createPrivacyPolicy = async (data: CreatePrivacyData): Promise<PrivacyPolicy | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<PrivacyPolicy> = await response.json();

      if (result.success && result.data) {
        toast.success('Privacy policy created successfully');
        // Refresh the list
        await fetchPrivacyPolicies();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing privacy policy
  const updatePrivacyPolicy = async (id: number, data: CreatePrivacyData): Promise<PrivacyPolicy | null> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/privacy/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<PrivacyPolicy> = await response.json();

      if (result.success && result.data) {
        toast.success('Privacy policy updated successfully');
        // Refresh the list
        await fetchPrivacyPolicies();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete privacy policy
  const deletePrivacyPolicy = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/privacy/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        toast.success('Privacy policy deleted successfully');
        // Refresh the list
        await fetchPrivacyPolicies();
        return true;
      } else {
        toast.error(result.error || 'Failed to delete privacy policy');
        return false;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Publish privacy policy
  const publishPrivacyPolicy = async (id: number): Promise<PrivacyPolicy | null> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/privacy/${id}/publish`, {
        method: 'POST',
      });

      const result: ApiResponse<PrivacyPolicy> = await response.json();

      if (result.success && result.data) {
        toast.success('Privacy policy published successfully');
        // Refresh the list
        await fetchPrivacyPolicies();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to publish privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    privacyPolicies,
    loading,
    error,
    stats,
    fetchPrivacyPolicies,
    fetchPrivacyPolicy,
    createPrivacyPolicy,
    updatePrivacyPolicy,
    deletePrivacyPolicy,
    publishPrivacyPolicy,
  };
}
