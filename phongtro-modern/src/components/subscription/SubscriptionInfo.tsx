'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  subscription?: {
    packageName: string;
    packageType: string;
    postLimit: number;
    usedPosts: number;
    remainingPosts: number;
    endDate: string;
    isExpired: boolean;
    canCreatePost: boolean;
  };
  message?: string;
}

interface SubscriptionInfoProps {
  onUpgradeRequired?: () => void;
  showFullInfo?: boolean;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ 
  onUpgradeRequired, 
  showFullInfo = true 
}) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const response = await api.subscription.getSubscriptionInfo();
      setSubscriptionInfo(response.data as SubscriptionInfo);
    } catch (error: any) {
      console.error('Error fetching subscription info:', error);
      toastManager.showError('Không thể tải thông tin gói đăng tin');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (remainingPosts: number, postLimit: number) => {
    const percentage = (remainingPosts / postLimit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPackageTypeDisplay = (packageType: string) => {
    const types = {
      free: 'Miễn phí',
      silver: 'Bạc',
      gold: 'Vàng',
      platinum: 'Bạch kim'
    };
    return types[packageType as keyof typeof types] || packageType;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionInfo || !subscriptionInfo.hasActiveSubscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-red-800">Chưa có gói đăng tin</h3>
            <p className="text-sm text-red-600 mt-1">
              Bạn cần chọn gói đăng tin để có thể đăng bài
            </p>
          </div>
          <Link
            href="/thanh-toan"
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Chọn gói
          </Link>
        </div>
      </div>
    );
  }

  const { subscription } = subscriptionInfo;
  if (!subscription) return null;

  const isLowQuota = subscription.remainingPosts <= 1;
  const isExpiringSoon = new Date(subscription.endDate).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000;

  return (
    <div className={`rounded-lg shadow-sm border p-4 ${
      isLowQuota || subscription.isExpired 
        ? 'bg-red-50 border-red-200' 
        : isExpiringSoon 
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">
            Gói {getPackageTypeDisplay(subscription.packageType)}
          </h3>
          <p className="text-sm text-gray-600">{subscription.packageName}</p>
        </div>
        
        {(isLowQuota || subscription.isExpired) && (
          <Link
            href="/thanh-toan"
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={() => onUpgradeRequired?.()}
          >
            Nâng cấp
          </Link>
        )}
      </div>

      {showFullInfo && (
        <div className="space-y-2">
          {/* Thông tin lượt đăng tin */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Lượt đăng tin:</span>
            <span className={`text-sm font-medium ${getStatusColor(subscription.remainingPosts, subscription.postLimit)}`}>
              {subscription.remainingPosts}/{subscription.postLimit} lượt
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                subscription.remainingPosts > subscription.postLimit * 0.5 
                  ? 'bg-green-500'
                  : subscription.remainingPosts > subscription.postLimit * 0.2
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.max(5, (subscription.remainingPosts / subscription.postLimit) * 100)}%` 
              }}
            ></div>
          </div>

          {/* Thông tin hết hạn */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Hết hạn:</span>
            <span className={`text-sm ${
              subscription.isExpired 
                ? 'text-red-600 font-medium'
                : isExpiringSoon 
                ? 'text-yellow-600'
                : 'text-gray-900'
            }`}>
              {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Cảnh báo */}
          {subscription.isExpired && (
            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
              ⚠️ Gói đăng tin đã hết hạn. Vui lòng gia hạn để tiếp tục đăng tin.
            </div>
          )}

          {isLowQuota && !subscription.isExpired && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
              ⚠️ Bạn chỉ còn {subscription.remainingPosts} lượt đăng tin. Hãy nâng cấp gói để tiếp tục.
            </div>
          )}

          {isExpiringSoon && !subscription.isExpired && !isLowQuota && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
              📅 Gói đăng tin sẽ hết hạn trong vài ngày tới.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;