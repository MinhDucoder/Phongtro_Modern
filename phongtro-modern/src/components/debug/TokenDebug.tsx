'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toastManager } from '@/components/ui/ToastManager';

export default function TokenDebug() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateTokenStatus = () => {
    const status = authApi.getTokenStatus();
    setTokenStatus(status);
  };

  useEffect(() => {
    updateTokenStatus();
    
    // Update token status every 5 seconds for debugging
    const interval = setInterval(updateTokenStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await authApi.refreshToken();
      updateTokenStatus();
      
      if (response.success) {
        toastManager.showSuccess('Token refreshed successfully');
        await refreshUser(); // Refresh user data
      } else {
        toastManager.showError(response.message || 'Token refresh failed');
      }
    } catch (error) {
      toastManager.showError(error instanceof Error ? error.message : 'Token refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearTokens = () => {
    authApi.clearTokens();
    updateTokenStatus();
    toastManager.showInfo('Tokens cleared');
  };

  const testApiCall = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success) {
        toastManager.showSuccess('API call successful');
      } else {
        toastManager.showError('API call failed: ' + response.message);
      }
    } catch (error) {
      toastManager.showError(error instanceof Error ? error.message : 'API call failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">🔧 Token Debug Panel</h3>
      
      <div className="space-y-4">
        {/* Authentication Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Authentication Status</h4>
          <div className="space-y-1 text-sm">
            <p>Authenticated: <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span></p>
            <p>User: {user ? `${user.full_name} (${user.role})` : 'None'}</p>
          </div>
        </div>

        {/* Token Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Token Status</h4>
          {tokenStatus ? (
            <div className="space-y-1 text-sm">
              <p>Has Token: <span className={`font-medium ${tokenStatus.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                {tokenStatus.hasToken ? 'Yes' : 'No'}
              </span></p>
              <p>Is Expired: <span className={`font-medium ${tokenStatus.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                {tokenStatus.isExpired ? 'Yes' : 'No'}
              </span></p>
              {tokenStatus.hasToken && (
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                  Current time: {new Date().toISOString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Manual Token Refresh'}
          </button>
          
          <button
            onClick={testApiCall}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test API Call (/user/me)
          </button>
          
          <button
            onClick={handleClearTokens}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Tokens
          </button>
          
          <button
            onClick={updateTokenStatus}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Status
          </button>
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium mb-2 text-yellow-800">Debug Notes</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Tokens are stored in localStorage as 'auth_tokens'</li>
            <li>• Auto-refresh triggers 5 minutes before expiry</li>
            <li>• Session expiry events are dispatched globally</li>
            <li>• Failed refresh attempts clear all tokens</li>
            <li>• API retries automatically on 401 (once per request)</li>
          </ul>
        </div>

        {/* Local Storage Inspector */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-800">Storage Contents</h4>
          <div className="text-xs font-mono text-blue-700 break-all">
            {typeof window !== 'undefined' && (
              <pre className="whitespace-pre-wrap">
                {localStorage.getItem('auth_tokens') || 'No tokens stored'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
