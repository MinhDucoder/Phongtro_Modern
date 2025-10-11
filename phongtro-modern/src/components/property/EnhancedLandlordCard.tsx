'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PhoneIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { toastManager } from '@/components/ui/ToastManager';
import { rentalRequestApi } from '@/lib/api';

interface Landlord {
  _id: string;
  full_name: string;
  phone?: string;
  email?: string;
  avatar?: string | { url?: string; public_id?: string };
  role?: string;
  is_verified?: boolean;
  responseTime?: string;
  onlineStatus?: 'online' | 'away' | 'offline';
  last_login?: string;
}

interface EnhancedLandlordCardProps {
  landlord: Landlord;
  propertyId: string;
  className?: string;
}

export default function EnhancedLandlordCard({ landlord, propertyId, className = '' }: EnhancedLandlordCardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showRentalRequestForm, setShowRentalRequestForm] = useState(false);
  const [landlordStats, setLandlordStats] = useState({
    responseTime: landlord.responseTime || 'Trong vòng 1 giờ',
    onlineStatus: 'offline', // Will be calculated based on last_login
    lastActive: landlord.last_login || null
  });

  // Calculate online status based on last_login
  const getOnlineStatus = (lastActive: string | null) => {
    if (!lastActive) return 'offline';
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 5) return 'online'; // Active within 5 minutes
    return 'offline'; // More than 5 minutes
  };

  // Update online status when component mounts or lastActive changes
  useEffect(() => {
    const onlineStatus = getOnlineStatus(landlordStats.lastActive);
    setLandlordStats(prev => ({
      ...prev,
      onlineStatus
    }));
  }, [landlordStats.lastActive]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toastManager.showError('🔐 Vui lòng đăng nhập để bắt đầu chat');
      router.push('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (landlord._id === user?._id) {
      toastManager.showError('🚫 Bạn không thể chat với chính mình');
      return;
    }

    try {
      setIsStartingChat(true);
      
      toastManager.showSuccess('💬 Đang mở chat...');
      
      // Navigate to profile chat tab with specific user
      router.push(`/profile?tab=chat&userId=${landlord._id}&propertyId=${propertyId}`);
      
    } catch (error) {
      toastManager.showError('❌ Không thể bắt đầu chat. Vui lòng thử lại.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleCall = () => {
    if (landlord.phone) {
      toastManager.showSuccess(`📞 Đang gọi ${landlord.phone}...`);
      window.open(`tel:${landlord.phone}`, '_self');
    } else {
      toastManager.showError('📞 Số điện thoại không khả dụng');
    }
  };

  const getOnlineStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getOnlineStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Đang hoạt động';
      default:
        return ''; // Không hiển thị text khi offline, chỉ hiển thị thời gian
    }
  };

  const getAvatarUrl = (avatar: any) => {
    if (!avatar) return '/placeholder-avatar.svg';
    if (typeof avatar === 'string') return avatar;
    if (avatar.url) return avatar.url;
    return '/placeholder-avatar.svg';
  };

  const getLastActiveText = (lastActive: string | null) => {
    if (!lastActive) return 'Chưa rõ';
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa hoạt động';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };



  return (
    <div className={`bg-white rounded-xl shadow-xl border border-gray-200 sticky top-8 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="relative">
            <Image
              src={getAvatarUrl(landlord.avatar)}
              alt={landlord.full_name}
              width={80}
              height={80}
              className="rounded-full border-4 border-blue-100"
            />
            {/* Online Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getOnlineStatusColor(landlordStats.onlineStatus)}`}></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center">
              <h3 className="font-bold text-gray-900 text-xl">{landlord.full_name}</h3>
              {landlord.is_verified && (
                <ShieldCheckIcon className="w-5 h-5 text-blue-500 ml-2" />
              )}
            </div>
            {landlordStats.onlineStatus === 'online' && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className={`w-2 h-2 rounded-full ${getOnlineStatusColor(landlordStats.onlineStatus)} mr-2`}></span>
                <span>{getOnlineStatusText(landlordStats.onlineStatus)}</span>
              </div>
            )}
            {landlordStats.lastActive && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ClockIcon className="w-3 h-3 mr-1" />
                <span>Hoạt động cuối: {getLastActiveText(landlordStats.lastActive)}</span>
              </div>
            )}
            {landlord.is_verified && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
                Đã xác thực
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Contact Actions */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Primary Chat Button */}
          <button
            onClick={handleStartChat}
            disabled={isStartingChat}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {isStartingChat ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Đang kết nối...
              </>
            ) : (
              <>
                <ChatBubbleLeftIcon className="w-6 h-6 mr-3" />
                {landlordStats.onlineStatus === 'online' ? 'Chat ngay' : 'Gửi tin nhắn'}
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              disabled={!landlord.phone}
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Gọi
            </button>
            
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  toastManager.showError('Vui lòng đăng nhập để gửi yêu cầu thuê');
                  router.push('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
                  return;
                }
                
                // Mở form yêu cầu thuê
                setShowRentalRequestForm(true);
              }}
              disabled={isSendingRequest}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Yêu cầu thuê
              </>
            </button>
          </div>
        </div>

        {/* Response Time Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-800">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Phản hồi thường trong {landlordStats.responseTime}
            </span>
          </div>
        </div>

      </div>

      {/* Safety Tips */}
      <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200 rounded-b-xl">
        <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          Lưu ý an toàn
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span>Luôn xem phòng trước khi thuê</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span>Kiểm tra giấy tờ chủ nhà</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span>Không chuyển tiền trước khi ký hợp đồng</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-600 mr-2">•</span>
            <span>Gặp mặt trực tiếp để trao đổi</span>
          </li>
        </ul>
      </div>

      {/* Rental Request Form Modal */}
      {showRentalRequestForm && (
        <RentalRequestForm
          landlord={landlord}
          propertyId={propertyId}
          onClose={() => {
            setShowRentalRequestForm(false);
          }}
        />
      )}
    </div>
  );
}

// Rental Request Form Component
interface RentalRequestFormProps {
  landlord: Landlord;
  propertyId: string;
  onClose: () => void;
}

function RentalRequestForm({ landlord, propertyId, onClose }: RentalRequestFormProps) {
  const { user } = useAuth();
   const [formData, setFormData] = useState({
     message: 'Xin chào! Tôi quan tâm đến phòng trọ này và muốn được xem phòng. Bạn có thể cho tôi biết thêm thông tin về phòng và lịch xem phòng được không?',
     moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
     numberOfPeople: 1,
     phone: user?.phone || '',
     email: user?.email || ''
   });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(false);

  // Check for existing pending request when component mounts
  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!user?._id || !propertyId) return;
      
      try {
        setIsCheckingPending(true);
        // TODO: Implement API call to check for pending requests
        // For now, we'll set this to false and let the submit handle the error
        setHasPendingRequest(false);
      } catch (error) {
        // Handle error silently
      } finally {
        setIsCheckingPending(false);
      }
    };

    checkPendingRequest();
  }, [user?._id, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.message.trim()) {
      return;
    }
    
    if (!formData.phone.trim()) {
      return;
    }
    
     if (!formData.email.trim()) {
       return;
     }
     
     if (!formData.moveInDate) {
       return;
     }
    
    try {
      setIsSubmitting(true);
      
      
      // Gửi yêu cầu thuê thông qua API
      const requestData = {
        postId: propertyId,
        message: formData.message,
        expectedMoveIn: formData.moveInDate,
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          preferredContactMethod: 'both'
        },
        tenantInfo: {
          numberOfPeople: formData.numberOfPeople
        }
      };
      
      const response = await rentalRequestApi.createRequest(requestData);
      
      if (response.success) {
        toastManager.showSuccess('Gửi yêu cầu thuê thành công!');
        onClose();
      } else {
        throw new Error(response.message || 'Không thể gửi yêu cầu thuê');
      }
      
    } catch (error: any) {
      
      // Xử lý các loại lỗi khác nhau với thông báo rõ ràng
      let errorMessage = '';
      
      if (error.message) {
        if (error.message.includes('You already have a pending request for this property') || 
            error.message.includes('already have a pending request')) {
          errorMessage = 'Bạn đã có yêu cầu thuê đang chờ xử lý cho phòng này';
          setHasPendingRequest(true);
        } else if (error.message.includes('not found')) {
          errorMessage = 'Không tìm thấy thông tin phòng trọ';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Thông tin không hợp lệ';
        } else if (error.message.includes('Error creating rental request')) {
          const actualError = error.message.replace('Error creating rental request: ', '');
          if (actualError.includes('already have a pending request')) {
            errorMessage = 'Bạn đã có yêu cầu thuê đang chờ xử lý cho phòng này';
            setHasPendingRequest(true);
          } else {
            errorMessage = actualError;
          }
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Không thể kết nối đến server';
      }
      
      toastManager.showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gửi yêu cầu thuê</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gửi yêu cầu thuê phòng đến <span className="font-semibold">{landlord.full_name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Warning for pending request */}
          {hasPendingRequest && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Bạn đã có yêu cầu thuê đang chờ xử lý
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Bạn đã gửi yêu cầu thuê cho phòng này trước đó. Vui lòng chờ chủ nhà phản hồi hoặc hủy yêu cầu cũ trước khi gửi yêu cầu mới.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn cho chủ nhà
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Nhập tin nhắn cho chủ nhà..."
                required
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập email..."
                  required
                />
              </div>
            </div>

            {/* Move-in Date & Number of People */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dự kiến chuyển vào
                </label>
                 <input
                   type="date"
                   value={formData.moveInDate}
                   onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số người
                </label>
                <select
                  value={formData.numberOfPeople}
                  onChange={(e) => setFormData({...formData, numberOfPeople: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 người</option>
                  <option value={2}>2 người</option>
                  <option value={3}>3 người</option>
                  <option value={4}>4 người</option>
                  <option value={5}>5+ người</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-4">
              {hasPendingRequest && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/profile?tab=requests';
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Xem yêu cầu đã gửi
                </button>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
