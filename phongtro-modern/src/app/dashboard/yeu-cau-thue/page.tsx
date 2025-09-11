'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock data - trong thực tế sẽ fetch từ API
const mockRequests = [
  {
    id: 'REQ-001',
    status: 'pending', // pending, accepted, rejected, canceled
    submittedAt: new Date('2024-01-15T10:30:00'),
    property: {
      id: '1',
      title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
      location: 'Hai Bà Trưng, Hà Nội',
      image: '/placeholder-room.svg',
      price: '3.8 triệu/tháng'
    },
    seeker: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      email: 'nguyenvana@email.com',
      avatar: '/placeholder-room.svg',
      age: 22,
      occupation: 'Sinh viên',
      message: 'Tôi muốn thuê phòng này để ở gần trường đại học. Có thể xem phòng vào cuối tuần không?',
      rentalHistory: 'Lần đầu thuê phòng',
      expectedMoveIn: '2024-02-01'
    }
  },
  {
    id: 'REQ-002',
    status: 'accepted',
    submittedAt: new Date('2024-01-14T15:20:00'),
    property: {
      id: '2',
      title: 'GẦN NGOẠI THƯƠNG, GTVT, HUTECH, HỒNG BÀNG, UEF',
      location: 'Bình Thạnh, Hồ Chí Minh',
      image: '/placeholder-room.svg',
      price: '3.3 triệu/tháng'
    },
    seeker: {
      name: 'Trần Thị B',
      phone: '0912345678',
      email: 'tranthib@email.com',
      avatar: '/placeholder-room.svg',
      age: 25,
      occupation: 'Nhân viên văn phòng',
      message: 'Tôi đang tìm phòng gần công ty. Phòng này có phù hợp không?',
      rentalHistory: 'Đã thuê phòng 2 năm',
      expectedMoveIn: '2024-01-20'
    }
  },
  {
    id: 'REQ-003',
    status: 'rejected',
    submittedAt: new Date('2024-01-13T09:15:00'),
    property: {
      id: '3',
      title: 'Ở ghép giường tầng sát vách DH Nguyễn Tất Thành',
      location: 'Quận 4, Hồ Chí Minh',
      image: '/placeholder-room.svg',
      price: '1.3 triệu/tháng'
    },
    seeker: {
      name: 'Lê Văn C',
      phone: '0934567890',
      email: 'levanc@email.com',
      avatar: '/placeholder-room.svg',
      age: 20,
      occupation: 'Sinh viên',
      message: 'Tôi muốn thuê phòng này để ở gần trường.',
      rentalHistory: 'Lần đầu thuê phòng',
      expectedMoveIn: '2024-01-25'
    }
  }
];

export default function RentalRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRequests = requests.filter(request => {
    if (selectedStatus === 'all') return true;
    return request.status === selectedStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'yellow',
          label: 'Chờ xử lý',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'accepted':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          label: 'Đã chấp nhận',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'red',
          label: 'Đã từ chối',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'canceled':
        return {
          icon: XCircleIcon,
          color: 'gray',
          label: 'Đã hủy',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'yellow',
          label: 'Chờ xử lý',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'accepted' }
          : req
      ));
      
      toast.success('Đã chấp nhận yêu cầu thuê');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu thuê này?')) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' }
          : req
      ));
      
      toast.success('Đã từ chối yêu cầu thuê');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý yêu cầu thuê</h1>
          <p className="text-gray-600 mt-2">Xem và xử lý các yêu cầu thuê phòng từ người dùng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Đã chấp nhận</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Đã từ chối</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({requests.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chờ xử lý ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã chấp nhận ({requests.filter(r => r.status === 'accepted').length})
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã từ chối ({requests.filter(r => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={request.seeker.avatar} 
                      alt={request.seeker.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.seeker.name}</h3>
                      <p className="text-sm text-gray-600">{request.seeker.occupation} • {request.seeker.age} tuổi</p>
                      <p className="text-sm text-gray-500">
                        Gửi yêu cầu lúc {formatDate(request.submittedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`${statusInfo.bgColor} ${statusInfo.textColor} px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusInfo.label}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Property Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Phòng được yêu cầu
                    </h4>
                    <div className="flex items-start space-x-3">
                      <img 
                        src={request.property.image} 
                        alt={request.property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {request.property.title}
                        </p>
                        <p className="text-sm text-gray-600">{request.property.location}</p>
                        <p className="text-sm font-medium text-green-600">{request.property.price}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seeker Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Thông tin người thuê
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{request.seeker.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Dự kiến chuyển vào: {new Date(request.seeker.expectedMoveIn).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-gray-600">Lịch sử thuê: {request.seeker.rentalHistory}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tin nhắn từ người thuê:</h4>
                  <p className="text-gray-700">{request.seeker.message}</p>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <XCircleIcon className="w-5 h-5 mr-2" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <EyeIcon className="w-5 h-5 mr-2" />
                      Xem chi tiết
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Yêu cầu đã được chấp nhận. Người thuê sẽ thanh toán và liên hệ với bạn.
                      </span>
                    </div>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800 font-medium">
                        Yêu cầu đã bị từ chối.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu thuê</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? 'Bạn chưa nhận được yêu cầu thuê nào.'
                : `Không có yêu cầu nào ở trạng thái "${getStatusInfo(selectedStatus).label}".`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Quản lý yêu cầu thuê | Phongtro123.com',
  description: 'Xem và xử lý các yêu cầu thuê phòng từ người dùng.',
};
