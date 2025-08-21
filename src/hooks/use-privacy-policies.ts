import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
// Privacy Policy interface (updated to remove language, defaults to English)
// ...existing code...

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

  // ...existing code...
  return {
    privacyPolicies,
    stats,
    error,
    fetchPrivacyPolicy,
    createPrivacyPolicy,
    updatePrivacyPolicy,
    deletePrivacyPolicy,
    publishPrivacyPolicy,
  };
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
// Move these functions inside usePrivacyPolicies

// Add these inside usePrivacyPolicies, after useEffect and before the return statement:
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

  const createPrivacyPolicy = async (data: CreatePrivacyData): Promise<PrivacyPolicy | null> => {
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
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    }
  };

  const updatePrivacyPolicy = async (id: number, data: CreatePrivacyData): Promise<PrivacyPolicy | null> => {
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
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    }
  };

  const deletePrivacyPolicy = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/privacy/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();

      if (result.success) {
        toast.success('Privacy policy deleted successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to delete privacy policy');
        return false;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const publishPrivacyPolicy = async (id: number): Promise<PrivacyPolicy | null> => {
    try {
      const response = await fetch(`/api/privacy/${id}/publish`, {
        method: 'POST',
      });

      const result: ApiResponse<PrivacyPolicy> = await response.json();

      if (result.success && result.data) {
        toast.success('Privacy policy published successfully');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to publish privacy policy');
        return null;
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      return null;
    }
  };

// Remove the duplicate return statement at the bottom (outside any function).
