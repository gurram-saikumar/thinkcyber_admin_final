// Test component to verify API calls
import { useCategories } from '@/hooks/use-categories-api';
import { useEffect } from 'react';

export function TestAPIConnection() {
  const { data, loading, error } = useCategories({ limit: 5 });

  useEffect(() => {
    // Log the API base URL to verify configuration
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Expected API call:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
  }, []);

  if (loading) {
    return (
      <div>
        <p>Loading categories...</p>
        <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
        <p>Check browser Network tab to see actual API calls</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
        <p>Check if your backend server is running and accessible</p>
      </div>
    );
  }

  return (
    <div>
      <h2>API Connection Test</h2>
      <p>✅ Successfully connected to: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
      <p>📊 Fetched {data?.categories?.length || 0} categories</p>
      
      {data?.categories && (
        <ul>
          {data.categories.slice(0, 3).map((category) => (
            <li key={category.id}>
              {category.name} - {category.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
