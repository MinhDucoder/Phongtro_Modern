'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DocumentCheckIcon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  PhotoIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SquaresPlusIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';

interface EnhancedPostModerationDetailProps {
  postId: string;
  onClose: () => void;
  onSuccess?: (action: 'approved' | 'rejected') => void;
}

export default function EnhancedPostModerationDetail({
  postId,
  onClose,
  onSuccess
}: EnhancedPostModerationDetailProps) {
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'landlord' | 'context'>('details');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');
  const [moderationNotes, setModerationNotes] = useState<string>('');
  const [contentIssues, setContentIssues] = useState<boolean>(false);
  const [pricingIssues, setPricingIssues] = useState<boolean>(false);
  const [imageIssues, setImageIssues] = useState<boolean>(false);
  const [addressIssues, setAddressIssues] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    description: false,
    amenities: false,
    images: true,
    location: false
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Common rejection reasons
  const rejectionReasons = [
    'Nội dung không phù hợp với quy định',
    'Hình ảnh không rõ ràng hoặc thiếu',
    'Thông tin không chính xác hoặc thiếu',
    'Giá niêm yết không hợp lý',
    'Địa chỉ không rõ ràng hoặc sai',
    'Bài đăng trùng lặp',
    'Khác (điền lý do)'
  ];

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/moderation/post/${postId}`);
        setPostData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu bài đăng');
        console.error('Error fetching post data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  const handleModeratePost = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason) {
      setError('Vui lòng chọn lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);

      const finalRejectionReason = rejectionReason === 'Khác (điền lý do)'
        ? customRejectionReason
        : rejectionReason;

      const payload = {
        status,
        reason: status === 'rejected' ? finalRejectionReason : undefined,
        notes: moderationNotes || undefined,
        contentIssues,
        pricingIssues,
        imageIssues,
        addressIssues,
        updateRoomAvailability: true,
        notifyLandlord: true
      };

      await axios.put(`/api/moderation/post/${postId}`, payload);

      if (onSuccess) {
        onSuccess(status);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${status === 'approved' ? 'duyệt' : 'từ chối'} bài đăng`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const nextImage = () => {
    if (postData?.roomDetails?.images && postData.roomDetails.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === postData.roomDetails.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (postData?.roomDetails?.images && postData.roomDetails.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? postData.roomDetails.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Đang tải dữ liệu bài đăng...">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Lỗi">
        <div className="p-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const { post, roomDetails, landlordDetails, moderationContext } = postData || {};

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="Kiểm duyệt bài đăng" 
      size="xl"
    >
      <div className="divide-y divide-gray-200">
        {/* Tabs navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2" />
              Chi tiết phòng
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'landlord'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('landlord')}
          >
            <div className="flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Thông tin người đăng
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'context'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('context')}
          >
            <div className="flex items-center">
              <SquaresPlusIcon className="h-5 w-5 mr-2" />
              Ngữ cảnh bổ sung
            </div>
          </button>
        </div>

        {/* Status indicator */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Trạng thái:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                post?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                post?.status === 'active' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {post?.status === 'pending' ? 'Chờ duyệt' :
                 post?.status === 'active' ? 'Đã duyệt' : 'Từ chối'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Đăng lúc: {new Date(post?.createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          
          {moderationContext?.recommendedAction && (
            <div className={`mt-2 p-2 rounded text-sm ${
              moderationContext.recommendedAction === 'approve' ? 'bg-green-50 text-green-700' :
              moderationContext.recommendedAction === 'flag' ? 'bg-yellow-50 text-yellow-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              <div className="font-medium flex items-center">
                {moderationContext.recommendedAction === 'approve' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                {moderationContext.recommendedAction === 'flag' && <ExclamationCircleIcon className="h-4 w-4 mr-1" />}
                {moderationContext.recommendedAction === 'review' && <ClipboardDocumentIcon className="h-4 w-4 mr-1" />}
                Đề xuất: {
                  moderationContext.recommendedAction === 'approve' ? 'Duyệt bài viết' :
                  moderationContext.recommendedAction === 'flag' ? 'Kiểm tra kỹ' : 'Xem xét thông thường'
                }
              </div>
              {moderationContext.recommendationReason && (
                <div className="mt-1">{moderationContext.recommendationReason}</div>
              )}
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic info section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('basicInfo')}
                >
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Thông tin cơ bản
                  </h3>
                  {expandedSections.basicInfo ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSections.basicInfo && (
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{roomDetails?.title || 'Không có tiêu đề'}</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-1" />
                          <span className="text-lg font-medium text-green-600">
                            {roomDetails?.price?.toLocaleString('vi-VN')} đ/tháng
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-1" />
                          <span>{roomDetails?.city || 'Chưa có thông tin thành phố'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {roomDetails?.area} m²
                        </span>
                        
                        {roomDetails?.amenities?.map((amenity: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              roomDetails?.completionScore >= 75 ? 'bg-green-600' :
                              roomDetails?.completionScore >= 50 ? 'bg-yellow-400' :
                              'bg-red-500'
                            }`}
                            style={{width: `${roomDetails?.completionScore}%`}}
                          ></div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Mức độ hoàn thiện: {roomDetails?.completionScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Images section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('images')}
                >
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Hình ảnh ({roomDetails?.images?.length || 0})
                  </h3>
                  {expandedSections.images ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSections.images && (
                  <div className="p-4">
                    {roomDetails?.images?.length > 0 ? (
                      <div>
                        <div className="relative h-80 w-full mb-4">
                          <Image 
                            src={roomDetails.images[currentImageIndex]} 
                            alt={`Hình ảnh ${currentImageIndex + 1}`}
                            fill
                            sizes="100%"
                            className="object-contain rounded-lg"
                          />
                          <button 
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full"
                          >
                            <ChevronDownIcon className="h-5 w-5 text-gray-700 rotate-90" />
                          </button>
                          <button 
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full"
                          >
                            <ChevronDownIcon className="h-5 w-5 text-gray-700 -rotate-90" />
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {roomDetails.images.map((image: string, index: number) => (
                            <div 
                              key={index} 
                              className={`relative h-20 cursor-pointer rounded-md overflow-hidden border-2 ${
                                index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <Image 
                                src={image} 
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                sizes="100px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="mt-2 text-sm text-gray-500">Không có hình ảnh</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('description')}
                >
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Mô tả
                  </h3>
                  {expandedSections.description ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSections.description && (
                  <div className="p-4">
                    {roomDetails?.description ? (
                      <div className="prose max-w-none text-gray-700">
                        <p>{roomDetails.description}</p>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">Không có mô tả</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Location section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('location')}
                >
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Địa chỉ
                  </h3>
                  {expandedSections.location ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {expandedSections.location && (
                  <div className="p-4">
                    {roomDetails?.address ? (
                      <div className="space-y-2">
                        <p className="text-gray-700">{roomDetails.address}</p>
                        <p className="text-gray-500 text-sm">{roomDetails.city}</p>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">Không có địa chỉ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'landlord' && (
            <div className="space-y-6">
              {/* Landlord Profile */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Thông tin người đăng
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {landlordDetails?.avatar ? (
                        <div className="h-14 w-14 relative rounded-full overflow-hidden">
                          <Image 
                            src={landlordDetails.avatar} 
                            alt={landlordDetails.name} 
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 bg-gray-200 flex items-center justify-center rounded-full">
                          <UserCircleIcon className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-semibold text-gray-900">{landlordDetails?.name}</h4>
                        {landlordDetails?.isVerified && (
                          <CheckBadgeIcon className="ml-1 h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-500">{landlordDetails?.email}</p>
                      <p className="text-gray-500">{landlordDetails?.phone}</p>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          landlordDetails?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          landlordDetails?.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                          landlordDetails?.role === 'agent' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {landlordDetails?.role === 'admin' ? 'Quản trị viên' :
                           landlordDetails?.role === 'moderator' ? 'Điều hành viên' :
                           landlordDetails?.role === 'agent' ? 'Đại lý' : 'Người dùng'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {landlordDetails?.accountAge} ngày trước
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Độ tin cậy</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                (landlordDetails?.reliability || 0) >= 75 ? 'bg-green-600' :
                                (landlordDetails?.reliability || 0) >= 50 ? 'bg-yellow-400' :
                                'bg-red-500'
                              }`}
                              style={{width: `${landlordDetails?.reliability || 0}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{landlordDetails?.reliability || 0}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái</p>
                        <p className="font-medium">
                          {landlordDetails?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Thống kê bài đăng</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-gray-700">
                          {landlordDetails?.statistics?.totalPosts || 0}
                        </p>
                        <p className="text-xs text-gray-500">Tổng số tin</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-green-700">
                          {landlordDetails?.statistics?.activePosts || 0}
                        </p>
                        <p className="text-xs text-green-500">Đã duyệt</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-yellow-700">
                          {landlordDetails?.statistics?.pendingPosts || 0}
                        </p>
                        <p className="text-xs text-yellow-500">Chờ duyệt</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-red-700">
                          {landlordDetails?.statistics?.rejectedPosts || 0}
                        </p>
                        <p className="text-xs text-red-500">Từ chối</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Other Posts by this Landlord */}
              {moderationContext?.otherPostsByLandlord?.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3">
                    <h3 className="text-base font-medium text-gray-900">Bài đăng khác của chủ phòng này</h3>
                  </div>
                  <div className="p-4">
                    <div className="divide-y divide-gray-200">
                      {moderationContext.otherPostsByLandlord.map((otherPost: any, index: number) => (
                        <div key={index} className="py-3 flex justify-between">
                          <div>
                            <p className="font-medium text-gray-700">
                              {otherPost.roomId?.title || 'Không có tiêu đề'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(otherPost.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                              otherPost.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              otherPost.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {otherPost.status === 'pending' ? 'Chờ duyệt' :
                               otherPost.status === 'active' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                            {otherPost.roomId?.price && (
                              <p className="text-sm text-gray-700 mt-1 text-right">
                                {otherPost.roomId.price.toLocaleString('vi-VN')} đ/tháng
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'context' && (
            <div className="space-y-6">
              {/* Similar Posts */}
              {moderationContext?.similarPosts?.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3">
                    <h3 className="text-base font-medium text-gray-900">Bài đăng tương tự (cùng khu vực)</h3>
                  </div>
                  <div className="p-4">
                    <div className="divide-y divide-gray-200">
                      {moderationContext.similarPosts.map((similarPost: any, index: number) => (
                        <div key={index} className="py-3 flex justify-between">
                          <div>
                            <p className="font-medium text-gray-700">
                              {similarPost.roomId?.title || 'Không có tiêu đề'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {similarPost.roomId?.address || 'Không có địa chỉ'}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                              similarPost.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              similarPost.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {similarPost.status === 'pending' ? 'Chờ duyệt' :
                               similarPost.status === 'active' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                            {similarPost.roomId?.price && (
                              <p className="text-sm text-gray-700 mt-1 text-right">
                                {similarPost.roomId.price.toLocaleString('vi-VN')} đ/tháng
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Moderation Notes */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <h3 className="text-base font-medium text-gray-900">Ghi chú kiểm duyệt</h3>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Nhập ghi chú nội bộ về bài đăng này..."
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Flagged Issues */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <h3 className="text-base font-medium text-gray-900">Vấn đề cần đánh dấu</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={contentIssues}
                        onChange={(e) => setContentIssues(e.target.checked)}
                      />
                      <span className="ml-2 text-gray-700">Vấn đề về nội dung mô tả</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={pricingIssues}
                        onChange={(e) => setPricingIssues(e.target.checked)}
                      />
                      <span className="ml-2 text-gray-700">Vấn đề về giá niêm yết</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={imageIssues}
                        onChange={(e) => setImageIssues(e.target.checked)}
                      />
                      <span className="ml-2 text-gray-700">Vấn đề về hình ảnh</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={addressIssues}
                        onChange={(e) => setAddressIssues(e.target.checked)}
                      />
                      <span className="ml-2 text-gray-700">Vấn đề về địa chỉ</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-2">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <div className="flex-1 mr-4">
            {/* Rejection reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={submitting}
              >
                <option value="">-- Chọn lý do từ chối --</option>
                {rejectionReasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
              {rejectionReason === 'Khác (điền lý do)' && (
                <textarea
                  className="mt-2 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Nhập lý do từ chối cụ thể..."
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  disabled={submitting}
                />
              )}
            </div>
          </div>
          <div className="flex space-x-2 items-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => handleModeratePost('rejected')}
              disabled={submitting}
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Từ chối
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => handleModeratePost('approved')}
              disabled={submitting}
            >
              <DocumentCheckIcon className="h-5 w-5 mr-2" />
              Duyệt bài đăng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}