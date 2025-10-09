'use client';

import { useState, useEffect } from 'react';
import { 
  StarIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  HandThumbUpIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  landlordReply?: {
    reply: string;
    date: string;
  };
  photos?: string[];
}

interface PropertyReviewsProps {
  propertyId: string;
  isOwner?: boolean;
  reviews?: Review[];
}

export default function PropertyReviews({ propertyId, isOwner = false, reviews: initialReviews }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with actual API call
        const mockReviews: Review[] = [
          {
            id: '1',
            userId: 'user1',
            userName: 'Nguyễn Văn A',
            userAvatar: '/placeholder-avatar.svg',
            rating: 5,
            title: 'Phòng rất đẹp và tiện nghi',
            comment: 'Phòng ở đây rất đẹp, đầy đủ tiện nghi. Chủ nhà thân thiện, hỗ trợ nhiệt tình. Vị trí thuận tiện, gần trường và siêu thị. Giá cả hợp lý so với chất lượng.',
            date: '2024-05-01T10:30:00Z',
            verified: true,
            helpful: 12,
            photos: ['/placeholder-room.svg', '/placeholder-room.svg'],
            landlordReply: {
              reply: 'Cảm ơn bạn đã đánh giá tích cực! Chúc bạn có những trải nghiệm tốt đẹp tại đây.',
              date: '2024-05-02T09:15:00Z'
            }
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Trần Thị B',
            userAvatar: '/placeholder-avatar.svg',
            rating: 4,
            title: 'Tốt nhưng có một số điểm cần cải thiện',
            comment: 'Phòng nhìn chung khá ổn, giá hợp lý. Tuy nhiên, wifi hơi yếu và tiếng ồn từ đường phố. Chủ nhà rất nhiệt tình và sẵn sàng hỗ trợ.',
            date: '2024-04-28T15:45:00Z',
            verified: false,
            helpful: 8
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Lê Văn C',
            userAvatar: '/placeholder-avatar.svg',
            rating: 5,
            title: 'Xuất sắc! Rất hài lòng',
            comment: 'Phòng đẹp, sạch sẽ, đầy đủ tiện nghi. Vị trí rất tốt, gần trường đại học và các tiện ích. Chủ nhà rất thân thiện và chuyên nghiệp. Sẽ giới thiệu cho bạn bè.',
            date: '2024-04-25T08:20:00Z',
            verified: true,
            helpful: 15
          },
          {
            id: '4',
            userId: 'user4',
            userName: 'Phạm Thị D',
            userAvatar: '/placeholder-avatar.svg',
            rating: 3,
            title: 'Ổn nhưng chưa xuất sắc',
            comment: 'Phòng ở được, giá cả hợp lý. Tuy nhiên, một số thiết bị cũ và cần thay thế. Chủ nhà thân thiện nhưng phản hồi hơi chậm.',
            date: '2024-04-20T14:10:00Z',
            verified: false,
            helpful: 3
          },
          {
            id: '5',
            userId: 'user5',
            userName: 'Hoàng Văn E',
            userAvatar: '/placeholder-avatar.svg',
            rating: 5,
            title: 'Hoàn hảo cho sinh viên',
            comment: 'Phòng rất phù hợp cho sinh viên. Đầy đủ tiện nghi cần thiết, wifi ổn định. Vị trí gần trường, thuận tiện đi lại. Chủ nhà rất quan tâm và hỗ trợ tận tình.',
            date: '2024-04-18T11:30:00Z',
            verified: true,
            helpful: 20
          }
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialReviews) {
      fetchReviews();
    }
  }, [propertyId]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const filteredReviews = reviews
    .filter(review => filterBy === 'all' || review.rating.toString() === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <StarIcon className="w-6 h-6 mr-3 text-yellow-500" />
            Đánh giá & Nhận xét
          </h2>
          {!isOwner && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Viết đánh giá
            </button>
          )}
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <span className="text-4xl font-bold text-gray-900 mr-2">{averageRating.toFixed(1)}</span>
              <div className="flex flex-col">
                {renderStars(Math.round(averageRating), 'lg')}
                <span className="text-sm text-gray-600 mt-1">
                  Dựa trên {reviews.length} đánh giá
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                <StarSolidIcon className="w-4 h-4 text-yellow-400 mx-1" />
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Đánh giá cao nhất</option>
              <option value="lowest">Đánh giá thấp nhất</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Hiển thị {filteredReviews.length} trong {reviews.length} đánh giá</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
            <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá</h3>
            <p className="text-gray-600">Hãy là người đầu tiên đánh giá phòng này!</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={review.userAvatar || '/placeholder-avatar.svg'}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full border-2 border-gray-200"
                    />
                    {review.verified && (
                      <CheckCircleIcon className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      {review.verified && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Đã xác thực
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {renderStars(review.rating, 'sm')}
                      <span className="ml-2">{formatDate(review.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                    <HandThumbUpIcon className="w-4 h-4 mr-1" />
                    {review.helpful}
                  </button>
                  <button className="text-sm text-gray-600 hover:text-red-600">
                    <FlagIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="mb-4">
                  <div className="flex space-x-2">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Reply */}
              {review.landlordReply && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-center mb-2">
                    <UserIcon className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-900">Phản hồi từ chủ nhà</span>
                    <span className="ml-2 text-sm text-blue-600">{formatDate(review.landlordReply.date)}</span>
                  </div>
                  <p className="text-blue-800">{review.landlordReply.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredReviews.length > 0 && (
        <div className="text-center">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
            Xem thêm đánh giá
          </button>
        </div>
      )}

      {/* Review Form Modal would go here */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Viết đánh giá</h3>
              {/* Review form content would go here */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
