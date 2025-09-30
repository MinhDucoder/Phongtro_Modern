'use client';

import TokenDebug from '@/components/debug/TokenDebug';
import DashboardGuard from '@/components/auth/DashboardGuard';

export default function TokenDebugPage() {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Token Management Debug</h1>
            <p className="text-gray-600 mt-2">
              Test and debug JWT token management system
            </p>
          </div>
          
          <TokenDebug />
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">⚠️ Development Only</h3>
            <p className="text-sm text-amber-700">
              This debug panel should only be accessible in development environment.
              It exposes sensitive token information and should not be available in production.
            </p>
          </div>
        </div>
      </div>
    </DashboardGuard>
  );
}
