'use client';

import React, { useState } from 'react';
import { testConnection } from '@/lib/api';

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Connection Test</h3>
      
      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {testResult && (
        <div className={`mt-4 p-3 rounded ${
          testResult.success 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          <strong>Result:</strong> {testResult.message}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected:</strong> This test sends a fake login request to the backend.</p>
        <p><strong>Success:</strong> Should receive 401/400 response (authentication failed).</p>
        <p><strong>Failure:</strong> Network error or server not responding.</p>
      </div>
    </div>
  );
}

