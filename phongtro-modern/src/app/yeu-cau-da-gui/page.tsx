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
import toast from 'react-hot-toast';

// Mock data - trong thực tế sẽ fetch từ API
const mockProperty = {
  id: '1',
  title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
  price: '3.8 triệu/tháng',
  area: '25 m²',
  location: 'Hai Bà Trưng, Hà Nội',
  address: 'Ngõ 3 Trần Khát Chân, Hai Bà Trưng, Hà Nội',
  image: '/placeholder-room.svg',
  contact: {
    name: 'Lê Nhật Duy',
    phone: '0365349437',
    avatar: '/placeholder-room.svg',
  }
};

const mockRequest = {
  id: 'REQ-001',
  status: 'pending', // pending, accepted, rejected, canceled
  submittedAt: new Date(),
  estimatedResponseTime: '24 giờ',
  property: mockProperty,
  seeker: {
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    email: 'nguyenvana@email.com',
    message: 'Tôi muốn thuê phòng này để ở gần trường đại học. Có thể xem phòng vào cuối tuần không?'
  }
};

export default function RequestSentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [request, setRequest] = useState(mockRequest);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCancelRequest = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu thuê này?')) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequest(prev => ({ ...prev, status: 'canceled' }));
      toast.success('Đã hủy yêu cầu thuê');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'yellow',
          title: 'Đang chờ phản hồi',
          description: 'Chủ nhà sẽ xem xét yêu cầu của bạn trong vòng 24 giờ',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'accepted':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          title: 'Đã được chấp nhận',
          description: 'Chủ nhà đã chấp nhận yêu cầu thuê của bạn',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'red',
          title: 'Đã bị từ chối',
          description: 'Chủ nhà đã từ chối yêu cầu thuê của bạn',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'canceled':
        return {
          icon: XCircleIcon,
          color: 'gray',
          title: 'Đã hủy',
          description: 'Bạn đã hủy yêu cầu thuê này',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'yellow',
          title: 'Đang xử lý',
          description: 'Yêu cầu đang được xử lý',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/phong-tro/${request.property.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại chi tiết phòng
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu thuê phòng</h1>
          <p className="text-gray-600 mt-2">Mã yêu cầu: {request.id}</p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 mb-8`}>
          <div className="flex items-center">
            <StatusIcon className={`w-8 h-8 ${statusInfo.textColor} mr-4`} />
            <div>
              <h2 className={`text-xl font-semibold ${statusInfo.textColor}`}>
                {statusInfo.title}
              </h2>
              <p className={`${statusInfo.textColor} mt-1`}>
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Thông tin phòng
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <img 
                  src={request.property.image} 
                  alt={request.property.title}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    {request.property.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {request.property.location}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {request.property.price}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Diện tích:</span>
                    <span className="ml-2 font-medium">{request.property.area}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Địa chỉ:</span>
                    <span className="ml-2 font-medium">{request.property.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Thông tin yêu cầu
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Người thuê</label>
                <p className="font-medium text-gray-900">{request.seeker.name}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Số điện thoại</label>
                <p className="font-medium text-gray-900">{request.seeker.phone}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900">{request.seeker.email}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Thời gian gửi</label>
                <p className="font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {request.submittedAt.toLocaleString('vi-VN')}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Tin nhắn</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                  {request.seeker.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {request.status === 'pending' && (
              <button
                onClick={handleCancelRequest}
                className="px-6 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Hủy yêu cầu
              </button>
            )}
            
            {request.status === 'accepted' && (
              <Link
                href={`/tom-tat-don-hang?requestId=${request.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
              >
                Xem tóm tắt đơn hàng
              </Link>
            )}
            
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-center"
            >
              Về Dashboard
            </Link>
            
            <Link
              href="/phong-tro"
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-center"
            >
              Tìm phòng khác
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            Lịch sử yêu cầu
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div>
                <p className="font-medium text-gray-900">Yêu cầu đã được gửi</p>
                <p className="text-sm text-gray-500">
                  {request.submittedAt.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            
            {request.status === 'pending' && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Đang chờ phản hồi từ chủ nhà</p>
                  <p className="text-sm text-gray-500">
                    Dự kiến phản hồi trong {request.estimatedResponseTime}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Yêu cầu thuê phòng đã gửi | Phongtro123.com',
  description: 'Theo dõi trạng thái yêu cầu thuê phòng của bạn.',
};
