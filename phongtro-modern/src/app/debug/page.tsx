'use client';

import React from 'react';
import ConnectionTest from '@/components/debug/ConnectionTest';

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
      
      <div className="space-y-6">
        <ConnectionTest />
        
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Environment Info</h3>
          <div className="space-y-2 text-sm">
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}</p>
            <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
          </div>
        </div>

        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Ensure backend server is running on port 5000</li>
            <li>Check browser console for detailed error messages</li>
            <li>Disable browser extensions that might block requests</li>
            <li>Try accessing <code>http://localhost:5000</code> directly in browser</li>
            <li>Check Windows Firewall settings</li>
            <li>Verify no proxy settings are interfering</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

