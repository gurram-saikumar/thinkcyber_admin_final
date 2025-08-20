// API Base URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// API Endpoints Constants - These are relative to the base URL
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: 'auth/login',
        REGISTER: 'auth/register',
        LOGOUT: 'auth/logout',
        REFRESH: 'auth/refresh',
        PROFILE: 'auth/profile',
    },

    // Categories endpoints
    CATEGORIES: {
        BASE: 'categories',
        BY_ID: (id: string | number) => `categories/${id}`,
        BULK_DELETE: 'categories/bulk-delete',
        SEARCH: 'categories/search',
    },

    // Subcategories endpoints
    SUBCATEGORIES: {
        BASE: 'subcategories',
        BY_ID: (id: string | number) => `subcategories/${id}`,
        BY_CATEGORY: (categoryId: string | number) => `subcategories/category/${categoryId}`,
        CREATE: 'subcategories',
        UPDATE: (id: string | number) => `subcategories/${id}`,
        DELETE: (id: string | number) => `subcategories/${id}`,
        BULK_DELETE: 'subcategories/bulk-delete',
        SEARCH: 'subcategories/search',
        LIST: 'subcategories/list',
        COUNT: 'subcategories/count',
        ACTIVE: 'subcategories/active',
        INACTIVE: 'subcategories/inactive',
        TOGGLE_STATUS: (id: string | number) => `subcategories/${id}/toggle-status`,
        DUPLICATE: (id: string | number) => `subcategories/${id}/duplicate`,
        EXPORT: 'subcategories/export',
        IMPORT: 'subcategories/import',
    },

    // Topics endpoints
    TOPICS: {
        BASE: 'topics',
        BY_ID: (id: string | number) => `topics/${id}`,
        BY_SUBCATEGORY: (subcategoryId: string | number) => `topics/subcategory/${subcategoryId}`,
        BY_CATEGORY: (categoryId: string | number) => `topics/category/${categoryId}`,
        CREATE: 'topics',
        UPDATE: (id: string | number) => `topics/${id}`,
        DELETE: (id: string | number) => `topics/${id}`,
        BULK_DELETE: 'topics/bulk-delete',
        SEARCH: 'topics/search',
        LIST: 'topics/list',
        COUNT: 'topics/count',
        PUBLISHED: 'topics/published',
        DRAFT: 'topics/draft',
        FEATURED: 'topics/featured',
        FREE: 'topics/free',
        PAID: 'topics/paid',
        BY_DIFFICULTY: (difficulty: string) => `topics/difficulty/${difficulty}`,
        BY_TAG: (tag: string) => `topics/tag/${tag}`,
        TOGGLE_STATUS: (id: string | number) => `topics/${id}/toggle-status`,
        TOGGLE_FEATURED: (id: string | number) => `topics/${id}/toggle-featured`,
        DUPLICATE: (id: string | number) => `topics/${id}/duplicate`,
        PUBLISH: (id: string | number) => `topics/${id}/publish`,
        ARCHIVE: (id: string | number) => `topics/${id}/archive`,
        EXPORT: 'topics/export',
        IMPORT: 'topics/import',
        MODULES: {
            BASE: (topicId: string | number) => `topics/${topicId}/modules`,
            BY_ID: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}`,
            CREATE: (topicId: string | number) => `topics/${topicId}/modules`,
            UPDATE: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}`,
            DELETE: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}`,
            REORDER: (topicId: string | number) => `topics/${topicId}/modules/reorder`,
        },
        VIDEOS: {
            BASE: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}/videos`,
            BY_ID: (topicId: string | number, moduleId: string | number, videoId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/${videoId}`,
            CREATE: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}/videos`,
            UPDATE: (topicId: string | number, moduleId: string | number, videoId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/${videoId}`,
            DELETE: (topicId: string | number, moduleId: string | number, videoId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/${videoId}`,
            UPLOAD: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/upload`,
            UPLOAD_MULTIPLE: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/upload-multiple`,
            REORDER: (topicId: string | number, moduleId: string | number) => `topics/${topicId}/modules/${moduleId}/videos/reorder`,
        },
    },

    // Terms and Conditions endpoints
    TERMS: {
        BASE: 'terms',
        BY_ID: (id: string | number) => `terms/${id}`,
        BY_LANGUAGE: (language: string) => `terms/language/${language}`,
        LATEST: 'terms/latest',
        PUBLISHED: 'terms/published',
        VERSIONS: 'terms/versions',
        PUBLISH: (id: string | number) => `terms/${id}/publish`,
        ARCHIVE: (id: string | number) => `terms/${id}/archive`,
        SEARCH: 'terms/search',
    },

    // Privacy Policy endpoints
    PRIVACY: {
        BASE: 'privacy',
        BY_ID: (id: string | number) => `privacy/${id}`,
        BY_LANGUAGE: (language: string) => `privacy/language/${language}`,
        LATEST: 'privacy/latest',
        PUBLISHED: 'privacy/published',
        VERSIONS: 'privacy/versions',
        PUBLISH: (id: string | number) => `privacy/${id}/publish`,
        ARCHIVE: (id: string | number) => `privacy/${id}/archive`,
        SEARCH: 'privacy/search',
    },

    // File Upload endpoints
    UPLOAD: {
        BASE: 'upload',
        VIDEO: 'upload/video',
        IMAGE: 'upload/image',
        DOCUMENT: 'upload/document',
        THUMBNAIL: 'upload/thumbnail',
        BULK: 'upload/bulk',
    },

    // Users endpoints
    USERS: {
        BASE: 'users',
        BY_ID: (id: string | number) => `users/${id}`,
        PROFILE: 'users/profile',
        BULK_DELETE: 'users/bulk-delete',
        SEARCH: 'users/search',
    },

    // Dashboard endpoints
    DASHBOARD: {
        OVERVIEW: 'dashboard/overview',
        STATS: 'dashboard/stats',
        ANALYTICS: 'dashboard/analytics',
    },

    // Reports endpoints
    REPORTS: {
        BASE: 'reports',
        CATEGORIES: 'reports/categories',
        USERS: 'reports/users',
        ACTIVITY: 'reports/activity',
    },

    // Homepage content endpoints
    HOMEPAGE: {
        BASE: 'homepage',
        BY_LANGUAGE: (language: string) => `homepage/${language}`,
        CONTENT: 'homepage/content',
        FAQS: 'homepage/faqs',
        FAQ_BY_ID: (id: string) => `homepage/faqs/${id}`,
    },
} as const;

// Helper function to build complete URL
export const buildApiUrl = (endpoint: string): string => {
    // Ensure no double slashes
    return `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
};

// Helper function to build query string
export const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

// Helper function to build complete URL with query parameters
export const buildApiUrlWithQuery = (endpoint: string, params?: Record<string, any>): string => {
    const baseUrl = buildApiUrl(endpoint);
    const queryString = params ? buildQueryString(params) : '';
    return `${baseUrl}${queryString}`;
};
