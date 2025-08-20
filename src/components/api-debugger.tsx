// Debug component to check API configuration
'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api-service';
import { useCategories } from '@/hooks/use-categories-api';

export function APIDebugger() {
  const [apiTest, setApiTest] = useState<any>(null);
  const { data, loading, error } = useCategories({ limit: 1 });

  useEffect(() => {
    console.log('🔧 Environment Variables:');
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    
    // Test direct API call
    const testAPI = async () => {
      try {
        console.log('🚀 Testing direct API call...');
        const response = await apiService.get('/categories?limit=1');
        setApiTest(response);
        console.log('📊 API Response:', response);
      } catch (error) {
        console.error('❌ API Test Error:', error);
        setApiTest({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #333', 
      margin: '20px',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5'
    }}>
      <h2>🔍 API Debug Information</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <p><strong>NEXT_PUBLIC_API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Expected API Calls:</h3>
        <p><strong>Categories URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}/categories</p>
        <p><strong>Single Category URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}/categories/1</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Hook Test Results:</h3>
        {loading && <p>🔄 Loading via hook...</p>}
        {error && <p>❌ Hook Error: {error}</p>}
        {data && (
          <div>
            <p>✅ Hook Success: Fetched {data.categories?.length || 0} categories</p>
            <p>📊 Total categories: {data.meta?.total || 0}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Direct API Test Results:</h3>
        {apiTest ? (
          <div>
            {apiTest.error ? (
              <p>❌ Direct API Error: {apiTest.error}</p>
            ) : (
              <div>
                <p>✅ Direct API Success: {apiTest.success ? 'true' : 'false'}</p>
                <p>📊 Data received: {JSON.stringify(apiTest.data || apiTest, null, 2).substring(0, 200)}...</p>
              </div>
            )}
          </div>
        ) : (
          <p>🔄 Testing direct API call...</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Browser Network Tab Instructions:</h3>
        <ol>
          <li>Open Developer Tools (F12)</li>
          <li>Go to Network tab</li>
          <li>Refresh this page</li>
          <li>Look for requests to categories endpoints</li>
          <li>The URL should be: <strong>{process.env.NEXT_PUBLIC_API_BASE_URL}/categories</strong></li>
          <li>If you see localhost:3000, there's still an issue</li>
        </ol>
      </div>

      <div>
        <h3>Troubleshooting:</h3>
        <ul>
          <li>✅ Environment variable is set: {process.env.NEXT_PUBLIC_API_BASE_URL ? 'YES' : 'NO'}</li>
          <li>✅ Development server restarted after env change: Check this manually</li>
          <li>✅ Browser cache cleared: Try hard refresh (Ctrl+Shift+R)</li>
          <li>✅ CORS enabled on backend: Check your backend server</li>
        </ul>
      </div>
    </div>
  );
}

export default APIDebugger;
