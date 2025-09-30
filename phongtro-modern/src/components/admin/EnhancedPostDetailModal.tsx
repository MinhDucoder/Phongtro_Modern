import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  XMarkIcon, 
  CheckIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  PhotoIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface PostDetail {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  location: string;
  city?: string;
  price: string;
  area?: string;
  category: string;
  images: string[];
  amenities?: string[];
  rejectionReason?: string;
  moderationNotes?: string;
  landlordInfo?: {
    name: string;
    phone: string;
    email: string;
    isVerified: boolean;
    accountAge: number;
  };
  moderation?: {
    priority: string;
    waitingTime: number;
    otherPostsByLandlord: number;
    approvedPosts: number;
    rejectedPosts: number;
    contentIssues?: boolean;
    pricingIssues?: boolean;
    imageIssues?: boolean;
    addressIssues?: boolean;
    violationDetails?: string;
  };
}

interface PostDetailModalProps {
  post: PostDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (postId: string, status: 'approved' | 'rejected', reason?: string, options?: any) => Promise<void>;
}

export default function PostDetailModal({ post, isOpen, onClose, onStatusChange }: PostDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [moderationNotes, setModerationNotes] = useState<string>('');
  const [postData, setPostData] = useState<PostDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'landlord' | 'moderation'>('details');
  const [moderationIssues, setModerationIssues] = useState({
    contentIssues: false,
    pricingIssues: false,
    imageIssues: false,
    addressIssues: false
  });
  const [violationDetails, setViolationDetails] = useState<string>('');
  
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch detailed post data when opened with an ID
  useEffect(() => {
    if (isOpen && post && post.id) {
      fetchPostDetails(post.id);
    }
  }, [isOpen, post?.id]);
  
  // Update form fields with post data when it changes
  useEffect(() => {
    if (postData) {
      setRejectionReason(postData.rejectionReason || '');
      setModerationNotes(postData.moderationNotes || '');
      
      // Set moderation issues if they exist
      if (postData.moderation) {
        setModerationIssues({
          contentIssues: postData.moderation.contentIssues || false,
          pricingIssues: postData.moderation.pricingIssues || false,
          imageIssues: postData.moderation.imageIssues || false,
          addressIssues: postData.moderation.addressIssues || false
        });
        setViolationDetails(postData.moderation.violationDetails || '');
      }
    }
  }, [postData]);

  // Fetch detailed post info from API
  const fetchPostDetails = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/moderation/${postId}/get`);
      if (!response.ok) {
        throw new Error('Không thể tải thông tin chi tiết');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setPostData(result.data);
      } else {
        toastManager.showError('Không thể tải thông tin chi tiết bài đăng');
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      toastManager.showError('Lỗi khi tải thông tin chi tiết');
      // Fallback to using the basic post data
      setPostData(post);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không xác định';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (hours: number) => {
    if (hours < 1) return 'Dưới 1 giờ';
    if (hours < 24) return `${Math.floor(hours)} giờ`;
    return `${Math.floor(hours / 24)} ngày ${Math.floor(hours % 24)} giờ`;
  };

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (!postData) return;
    
    try {
      setIsSubmitting(true);
      
      // Chuẩn bị options
      const options = {
        notes: moderationNotes,
        contentIssues: moderationIssues.contentIssues,
        pricingIssues: moderationIssues.pricingIssues,
        imageIssues: moderationIssues.imageIssues,
        addressIssues: moderationIssues.addressIssues,
        violationDetails
      };
      
      // Kiểm tra nếu từ chối nhưng không có lý do
      if (status === 'rejected') {
        const reason = rejectionReason.trim();
        if (!reason) {
          toastManager.showError('Vui lòng nhập lý do từ chối bài đăng');
          reasonRef.current?.focus();
          setIsSubmitting(false);
          return;
        }
        
        // Kiểm tra nếu có lỗi nhưng không chọn loại lỗi cụ thể
        if (!(moderationIssues.contentIssues || moderationIssues.pricingIssues || 
              moderationIssues.imageIssues || moderationIssues.addressIssues)) {
          toastManager.showError('Vui lòng chọn ít nhất một loại vấn đề với bài đăng');
          setIsSubmitting(false);
          return;
        }
        
        await onStatusChange(postData.id, status, reason, options);
      } else {
        await onStatusChange(postData.id, status, undefined, options);
      }
      
      toastManager.showSuccess(
        status === 'approved' 
          ? 'Đã phê duyệt bài đăng thành công' 
          : 'Đã từ chối bài đăng'
      );
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError('Không thể cập nhật trạng thái bài đăng');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setRejectionReason('');
    setModerationNotes('');
    setModerationIssues({
      contentIssues: false,
      pricingIssues: false,
      imageIssues: false,
      addressIssues: false
    });
    setViolationDetails('');
    setActiveTab('details');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Đang chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="success">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="error">Đã từ chối</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error">Cao</Badge>;
      case 'normal':
        return <Badge variant="warning">Trung bình</Badge>;
      case 'low':
        return <Badge variant="default">Thấp</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };
  
  const getAmenityLabel = (amenity: string) => {
    const labels: {[key: string]: string} = {
      wifi: 'Wifi',
      aircon: 'Điều hòa',
      private_wc: 'WC riêng',
      washing_machine: 'Máy giặt',
      fridge: 'Tủ lạnh',
      balcony: 'Ban công',
      window: 'Cửa sổ',
      kitchen: 'Bếp'
    };
    
    return labels[amenity] || amenity;
  };

  // Handle close with proper validation
  const handleClose = () => {
    if (isSubmitting || isLoading) {
      return; // Don't close if submitting or loading
    }
    onClose();
  };

  // Render placeholder khi không có bài đăng
  if (!post) {
    return null;
  }
  
  // Use the detailed data if available, otherwise use the basic data
  const displayData = postData || post;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chi tiết bài đăng"
      size="xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin chi tiết...</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold truncate">{displayData.title}</h2>
              {getStatusBadge(displayData.status)}
            </div>
            <p className="text-gray-600 text-sm">
              Kiểm tra nội dung bài đăng trước khi duyệt hoặc từ chối
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-1 py-4 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin bài đăng
              </button>
              <button
                onClick={() => setActiveTab('landlord')}
                className={`px-1 py-4 text-sm font-medium ${
                  activeTab === 'landlord'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Người đăng
              </button>
              <button
                onClick={() => setActiveTab('moderation')}
                className={`px-1 py-4 text-sm font-medium ${
                  activeTab === 'moderation'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kiểm duyệt
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {activeTab === 'details' && (
              <>
                {/* Thông tin cơ bản */}
                <div>
                  <div className="bg-gray-50 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Địa chỉ:</h4>
                        <p className="text-darker">{displayData.location}</p>
                        {displayData.city && <p className="text-sm text-gray-600">{displayData.city}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Giá thuê:</h4>
                        <p className="text-darker text-green-600 font-medium">{displayData.price}</p>
                      </div>
                    </div>
                    
                    {displayData.area && (
                      <div className="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Diện tích:</h4>
                          <p className="text-darker">{displayData.area}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Ngày đăng:</h4>
                        <p className="text-darker">{formatDate(displayData.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ảnh bài đăng */}
                {displayData.images && displayData.images.filter(image => image && image.trim() !== '').length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-1 text-gray-600" /> 
                      Hình ảnh ({displayData.images.filter(image => image && image.trim() !== '').length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {displayData.images.filter(image => image && image.trim() !== '').map((image, index) => (
                        <div key={index} className="relative h-48 rounded-md overflow-hidden border">
                          <Image 
                            src={image} 
                            alt={`Ảnh ${index + 1} của bài đăng`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500">
                    <PhotoIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>Không có hình ảnh</p>
                  </div>
                )}
                
                {/* Tiện nghi */}
                {displayData.amenities && displayData.amenities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Tiện nghi</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayData.amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {getAmenityLabel(amenity)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mô tả */}
                <div className="space-y-2">
                  <h3 className="font-medium">Mô tả</h3>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {displayData.description || 'Không có mô tả'}
                  </div>
                </div>

                {/* Hiển thị lý do từ chối nếu có */}
                {displayData.status === 'rejected' && displayData.rejectionReason && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                      Lý do từ chối
                    </h3>
                    <div className="bg-red-50 p-3 rounded-md text-red-700 border border-red-200">
                      {displayData.rejectionReason}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'landlord' && (
              <div className="space-y-6">
                {/* Thông tin chủ nhà */}
                {displayData.landlordInfo ? (
                  <div className="bg-gray-50 rounded-md p-4 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{displayData.landlordInfo.name}</h3>
                          {displayData.landlordInfo.isVerified && (
                            <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Đã xác thực
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Thành viên {displayData.landlordInfo.accountAge} ngày
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-500" />
                        <span>{displayData.landlordInfo.phone || 'Không có số điện thoại'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                        <span>{displayData.landlordInfo.email || 'Không có email'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
                    <UserIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p>Không có thông tin chi tiết về người đăng</p>
                  </div>
                )}
                
                {/* Thống kê bài đăng */}
                {displayData.moderation && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Bài đăng khác của người này</h3>
                    <div className="bg-white border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-semibold text-darker">{displayData.moderation.otherPostsByLandlord}</p>
                          <p className="text-sm text-gray-600">Tổng bài đăng</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-green-600">{displayData.moderation.approvedPosts}</p>
                          <p className="text-sm text-gray-600">Đã duyệt</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-red-600">{displayData.moderation.rejectedPosts}</p>
                          <p className="text-sm text-gray-600">Đã từ chối</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="space-y-6">
                {/* Thông tin kiểm duyệt */}
                {displayData.moderation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="font-medium mb-3">Thông tin kiểm duyệt</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Độ ưu tiên:</span>
                          <span>{getPriorityBadge(displayData.moderation.priority)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian chờ:</span>
                          <span>{formatRelativeTime(displayData.moderation.waitingTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {displayData.status === 'rejected' && (
                      <div className="bg-red-50 rounded-md p-4">
                        <h3 className="font-medium text-red-600 mb-3">Lý do từ chối</h3>
                        <p>{displayData.rejectionReason || 'Không có lý do cụ thể'}</p>
                        
                        {/* Hiển thị các vấn đề đã đánh dấu */}
                        {(displayData.moderation.contentIssues || 
                          displayData.moderation.pricingIssues || 
                          displayData.moderation.imageIssues || 
                          displayData.moderation.addressIssues) && (
                          <div className="mt-3 space-y-1">
                            <p className="font-medium text-red-600">Các vấn đề:</p>
                            <ul className="list-disc list-inside text-sm text-red-700">
                              {displayData.moderation.contentIssues && <li>Nội dung không phù hợp</li>}
                              {displayData.moderation.pricingIssues && <li>Vấn đề về giá</li>}
                              {displayData.moderation.imageIssues && <li>Hình ảnh không phù hợp</li>}
                              {displayData.moderation.addressIssues && <li>Địa chỉ không chính xác</li>}
                            </ul>
                          </div>
                        )}
                        
                        {displayData.moderation.violationDetails && (
                          <div className="mt-3">
                            <p className="font-medium text-red-600">Chi tiết vi phạm:</p>
                            <p className="text-sm text-red-700">{displayData.moderation.violationDetails}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Form kiểm duyệt */}
                {displayData.status === 'pending' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-medium mb-2">Ghi chú kiểm duyệt (tùy chọn)</h3>
                      <textarea
                        value={moderationNotes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModerationNotes(e.target.value)}
                        placeholder="Nhập ghi chú nội bộ về bài đăng này"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-1 text-red-500" />
                        Đánh dấu các vấn đề (nếu từ chối)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={moderationIssues.contentIssues}
                            onChange={(e) => setModerationIssues({...moderationIssues, contentIssues: e.target.checked})}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          <span>Nội dung không phù hợp</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={moderationIssues.pricingIssues}
                            onChange={(e) => setModerationIssues({...moderationIssues, pricingIssues: e.target.checked})}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          <span>Vấn đề về giá</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={moderationIssues.imageIssues}
                            onChange={(e) => setModerationIssues({...moderationIssues, imageIssues: e.target.checked})}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          <span>Hình ảnh không phù hợp</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={moderationIssues.addressIssues}
                            onChange={(e) => setModerationIssues({...moderationIssues, addressIssues: e.target.checked})}
                            className="rounded text-blue-600 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          <span>Địa chỉ không chính xác</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Chi tiết vi phạm (tùy chọn)</h3>
                      <textarea
                        value={violationDetails}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setViolationDetails(e.target.value)}
                        placeholder="Mô tả chi tiết về các vi phạm cụ thể (nếu có)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2 text-red-600">Lý do từ chối (bắt buộc nếu từ chối)</h3>
                      <textarea
                        ref={reasonRef}
                        value={rejectionReason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                        placeholder="Nhập lý do từ chối bài đăng này (bắt buộc nếu từ chối)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <Button onClick={handleClose} variant="secondary" disabled={isSubmitting}>
              Đóng
            </Button>
            
            {displayData.status === 'pending' && (
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleStatusChange('rejected')}
                  variant="danger"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  leftIcon={<XMarkIcon className="w-5 h-5" />}
                >
                  Từ chối
                </Button>
                
                <Button 
                  onClick={() => handleStatusChange('approved')}
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  leftIcon={<CheckIcon className="w-5 h-5" />}
                >
                  Duyệt
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}