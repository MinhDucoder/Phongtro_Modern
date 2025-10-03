'use client';

import PostPropertyForm from '@/components/post/PostPropertyForm';
import SubscriptionInfo from '@/components/subscription/SubscriptionInfo';
import PostLimitExceededModal from '@/components/subscription/PostLimitExceededModal';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function PostPropertyPage() {
  const searchParams = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    checkSubscription();
    
    // Kiểm tra payment status từ URL
    const paymentStatus = searchParams.get('payment');
    const packageName = searchParams.get('package');
    
    if (paymentStatus === 'success') {
      toast.success(`🎉 Thanh toán thành công! Bạn đã nâng cấp lên gói ${packageName}`, {
        duration: 5000,
      });
      // Remove payment params from URL
      window.history.replaceState({}, '', '/dang-tin');
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại. Vui lòng thử lại.', {
        duration: 5000,
      });
      window.history.replaceState({}, '', '/dang-tin');
    }
  }, [searchParams]);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.subscription.getSubscriptionInfo();
      const data = response.data as any;
      
      setSubscriptionInfo(data);
      
      // Kiểm tra xem có thể đăng tin không
      if (!data.hasActiveSubscription) {
        setCanPost(false);
        setShowUpgradeModal(true);
      } else if (data.subscription) {
        const canCreatePost = data.subscription.remainingPosts > 0 && !data.subscription.isExpired;
        setCanPost(canCreatePost);
        
        if (!canCreatePost) {
          setShowUpgradeModal(true);
        }
      }
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast.error('Không thể kiểm tra thông tin gói đăng tin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeRequired = () => {
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra thông tin gói đăng tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Đăng tin cho thuê</h1>
            <p className="mt-2 text-lg text-gray-600">
              Đăng tin miễn phí - Tiếp cận hàng nghìn khách thuê
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Thông tin gói đăng tin */}
        <div className="mb-6">
          <SubscriptionInfo 
            onUpgradeRequired={handleUpgradeRequired}
            showFullInfo={true}
          />
        </div>

        {/* Hiển thị form hoặc cảnh báo */}
        {canPost ? (
          <PostPropertyForm />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Không thể đăng tin
            </h2>
            
            <p className="text-gray-600 mb-6">
              {!subscriptionInfo?.hasActiveSubscription 
                ? 'Bạn chưa có gói đăng tin nào.'
                : subscriptionInfo?.subscription?.isExpired
                ? 'Gói đăng tin của bạn đã hết hạn.'
                : 'Bạn đã sử dụng hết lượt đăng tin.'
              }
            </p>
            
            <p className="text-lg font-medium text-gray-900 mb-6">
              Vui lòng chọn gói đăng tin phù hợp để tiếp tục.
            </p>
            
            <a
              href="/thanh-toan"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-lg"
            >
              Chọn gói đăng tin
            </a>
          </div>
        )}
      </div>

      {/* Modal cảnh báo hết lượt */}
      <PostLimitExceededModal
        isOpen={showUpgradeModal && !canPost}
        onClose={() => setShowUpgradeModal(false)}
        packageName={subscriptionInfo?.subscription?.packageName || 'Miễn phí'}
        usedPosts={subscriptionInfo?.subscription?.usedPosts || 0}
        postLimit={subscriptionInfo?.subscription?.postLimit || 3}
      />
    </div>
  );
}
