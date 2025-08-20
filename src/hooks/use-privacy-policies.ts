import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
      if (filters?.search) params.search = filters.search;
      if (filters?.status && filters.status !== 'all') params.status = filters.status;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

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
      }ib/api-service';
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
export function usePrivacyPolicies() {
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    draft: number;
    published: number;
    archived: number;
    latestVersion: string;
  } | null>(null);

  // Fetch all privacy policies
  const fetchPrivacyPolicies = async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const url = `/api/privacy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      const result: PrivacyPoliciesResponse = await response.json();

      if (result.success) {
        setPrivacyPolicies(result.data);
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to fetch privacy policies');
        toast.error('Failed to fetch privacy policies. Please try again.');
      }
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
