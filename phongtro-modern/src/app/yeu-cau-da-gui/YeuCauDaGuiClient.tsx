'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  HomeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowLeftIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function YeuCauDaGuiClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  
  const [requests, setRequests] = useState([
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
      propertyImage: '/placeholder-room.svg',
      propertyPrice: '3.8 triệu/tháng',
      propertyLocation: 'Hai Bà Trưng, Hà Nội',
      status: 'pending',
      statusText: 'Chờ phản hồi',
      submittedAt: '2024-01-15T10:30:00Z',
      message: 'Tôi quan tâm đến phòng trọ này. Mong được xem phòng và thảo luận thêm về điều kiện thuê.',
      contactInfo: {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@email.com'
      }
    },
    {
      id: '2',
      propertyId: '2',
      propertyTitle: 'GẦN NGOẠI THƯƠNG, GTVT, HUTECH, HỒNG BÀNG, UEF, VietVision, Ga Metro',
      propertyImage: '/placeholder-room.svg',
      propertyPrice: '3.3 triệu/tháng',
      propertyLocation: 'Bình Thạnh, Hồ Chí Minh',
      status: 'approved',
      statusText: 'Đã duyệt',
      submittedAt: '2024-01-14T15:20:00Z',
      message: 'Tôi muốn thuê phòng này từ tháng 2. Có thể xem phòng vào cuối tuần không?',
      contactInfo: {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@email.com'
      }
    }
  ]);

  const [filteredRequests, setFilteredRequests] = useState(requests);

  useEffect(() => {
    if (propertyId) {
      const filtered = requests.filter(req => req.propertyId === propertyId);
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [propertyId, requests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay lại
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Yêu cầu thuê phòng đã gửi
          </h1>
          <p className="text-gray-600">
            Theo dõi trạng thái các yêu cầu thuê phòng của bạn
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ phản hồi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRequests.filter(req => req.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRequests.filter(req => req.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có yêu cầu nào
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa gửi yêu cầu thuê phòng nào. Hãy tìm kiếm và gửi yêu cầu thuê phòng.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Tìm phòng trọ
              </Link>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={request.propertyImage}
                        alt={request.propertyTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {request.propertyTitle}
                        </h3>
                        <p className="text-blue-600 font-medium mb-1">
                          {request.propertyPrice}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          {request.propertyLocation}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(request.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.statusText}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tin nhắn của bạn:</h4>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3 mb-4">
                      {request.message}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin liên hệ:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-2" />
                            {request.contactInfo.name}
                          </p>
                          <p className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {request.contactInfo.phone}
                          </p>
                          <p className="flex items-center">
                            <span className="w-4 h-4 mr-2">@</span>
                            {request.contactInfo.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <Link
                          href={`/phong-tro/${request.propertyId}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <HomeIcon className="w-4 h-4 mr-2" />
                          Xem lại tin đăng
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
