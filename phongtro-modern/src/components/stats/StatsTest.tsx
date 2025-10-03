'use client';

import { useState } from 'react';
import { statsApi } from '@/lib/api';
import { debugAPI, testURLs as testURLsDebug } from '@/lib/debug-api';

export default function StatsTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing stats API...');
      
      // Test direct fetch first
      const directResult = await debugAPI();
      console.log('Direct fetch result:', directResult);
      
      // Test statsApi
      const response = await statsApi.getOverview();
      console.log('StatsApi Response:', response);
      
      setResult({ directResult, statsApiResult: response });
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testURLs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing different URLs...');
      await testURLsDebug();
      setResult({ message: 'Check console for URL test results' });
    } catch (err) {
      console.error('URL Test Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Stats API Test</h3>
      
      <div className="space-x-2">
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
        
        <button
          onClick={testURLs}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test URLs'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success:</strong>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
