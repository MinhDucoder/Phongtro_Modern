'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { toastManager } from '@/components/ui/ToastManager';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    image: string;
    landlord: {
      name: string;
      avatar: string;
    };
  };
  onReviewSubmitted?: (review: any) => void;
}

interface ReviewData {
  rating: number;
  title: string;
  content: string;
  categories: {
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
    amenities: number;
  };
  recommend: boolean;
  anonymous: boolean;
}

export default function WriteReviewModal({ 
  isOpen, 
  onClose, 
  property, 
  onReviewSubmitted 
}: WriteReviewModalProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    content: '',
    categories: {
      cleanliness: 0,
      location: 0,
      value: 0,
      communication: 0,
      amenities: 0
    },
    recommend: false,
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryLabels = {
    cleanliness: 'Vệ sinh',
    location: 'Vị trí',
    value: 'Giá trị',
    communication: 'Giao tiếp',
    amenities: 'Tiện nghi'
  };

  const handleRatingChange = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleCategoryRatingChange = (category: keyof ReviewData['categories'], rating: number) => {
    setReviewData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating
      }
    }));
  };

  const handleInputChange = (field: keyof ReviewData, value: string | boolean) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      toastManager.showError('Vui lòng chọn đánh giá tổng thể');
      return;
    }

    if (!reviewData.title.trim()) {
      toastManager.showError('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    if (!reviewData.content.trim()) {
      toastManager.showError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const review = {
        id: `REV-${Date.now()}`,
        ...reviewData,
        property: property,
        submittedAt: new Date(),
        status: 'published'
      };
      
      toastManager.showSuccess('Đánh giá đã được gửi thành công!');
      onReviewSubmitted?.(review);
      onClose();
      
      // Reset form
      setReviewData({
        rating: 0,
        title: '',
        content: '',
        categories: {
          cleanliness: 0,
          location: 0,
          value: 0,
          communication: 0,
          amenities: 0
        },
        recommend: false,
        anonymous: false
      });
    } catch (error) {
      toastManager.showError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Viết đánh giá</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Property Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start space-x-4">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {property.title}
              </h3>
              <p className="text-sm text-gray-600">{property.location}</p>
              <div className="flex items-center mt-2">
                <img 
                  src={property.landlord.avatar} 
                  alt={property.landlord.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">Chủ nhà: {property.landlord.name}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Đánh giá tổng thể *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none"
                >
                  {star <= reviewData.rating ? (
                    <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {reviewData.rating > 0 && (
                  <>
                    {reviewData.rating === 1 && 'Rất tệ'}
                    {reviewData.rating === 2 && 'Tệ'}
                    {reviewData.rating === 3 && 'Bình thường'}
                    {reviewData.rating === 4 && 'Tốt'}
                    {reviewData.rating === 5 && 'Rất tốt'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Đánh giá chi tiết
            </label>
            <div className="space-y-4">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryRatingChange(key as keyof ReviewData['categories'], star)}
                        className="focus:outline-none"
                      >
                        {star <= reviewData.categories[key as keyof ReviewData['categories']] ? (
                          <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tiêu đề đánh giá *
            </label>
            <input
              type="text"
              value={reviewData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Tóm tắt ngắn gọn về trải nghiệm của bạn"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewData.title.length}/100 ký tự
            </p>
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nội dung đánh giá *
            </label>
            <textarea
              value={reviewData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm thuê phòng của bạn..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewData.content.length}/1000 ký tự
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recommend"
                checked={reviewData.recommend}
                onChange={(e) => handleInputChange('recommend', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="recommend" className="ml-2 text-sm text-gray-700">
                Tôi khuyên bạn nên thuê phòng này
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={reviewData.anonymous}
                onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Đăng đánh giá ẩn danh
              </label>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn viết đánh giá</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hãy chia sẻ trải nghiệm thực tế của bạn</li>
                  <li>• Tránh sử dụng ngôn ngữ không phù hợp</li>
                  <li>• Không tiết lộ thông tin cá nhân</li>
                  <li>• Đánh giá công bằng và khách quan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
