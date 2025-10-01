'use client';

import { useState, useEffect, useRef } from 'react';
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
import { rentalRequestApi } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';
import { getFirstImage } from '@/lib/imageUtils';

// Removed mock data - using real API only

export default function YeuCauThueClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const lastFetchRef = useRef<{ key: string; ts: number } | null>(null);
  // Fetch stats only once when component mounts
  useEffect(() => {
    setMounted(true);
    console.log('Component mounted, fetching stats...');
    fetchStats();
  }, []);

  // Fetch requests when status changes
  useEffect(() => {
    console.log('Tab changed to:', selectedStatus, 'Stats should remain unchanged');
    const key = `req-${selectedStatus}`;
    const now = Date.now();
    if (lastFetchRef.current && lastFetchRef.current.key === key && (now - lastFetchRef.current.ts) < 500) {
      return;
    }
    lastFetchRef.current = { key, ts: now };
    fetchRequests({ showToast: true });
  }, [selectedStatus]);

  const fetchRequests = async (options?: { showToast?: boolean }) => {
    try {
      setLoading(true);
      const response = await rentalRequestApi.getLandlordRequests({
        page: 1,
        limit: 20,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      });

      if (response && response.data && response.data.requests) {
        setRequests(response.data.requests);
        
        if (options?.showToast) {
          toastManager.showSuccess(`Đã tải ${response.data.requests.length} yêu cầu thuê`);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toastManager.showError('Không thể tải danh sách yêu cầu thuê');
      // Set empty array on error - no fallback to mock data
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from API...');
      // Use dedicated stats API endpoint
      const response = await rentalRequestApi.getRequestStats();
      console.log('Stats API response:', response);
      
      if (response && response.success !== false && response.data) {
        setStats(response.data);
        console.log('Stats set successfully from API:', response.data);
        return;
      } else {
        console.log('Stats API failed or no data, using fallback calculation');
      }
    } catch (error) {
      console.error('Stats API error:', error);
      console.log('Using fallback calculation from requests');
    }
    
    // Always use fallback calculation for now
    await fetchStatsFromRequests();
  };

  const fetchStatsFromRequests = async () => {
    try {
      console.log('Fetching all requests for stats calculation...');
      const response = await rentalRequestApi.getLandlordRequests({
        page: 1,
        limit: 1000,
        status: undefined
      });
      
      console.log('Requests API response:', response);
      
      if (response && response.data && response.data.requests) {
        const allRequests = response.data.requests;
        console.log('Total requests found:', allRequests.length);
        console.log('Request statuses:', allRequests.map(r => r.status));
        
        const calculatedStats = {
          total: allRequests.length,
          pending: allRequests.filter(r => r.status === 'pending').length,
          accepted: allRequests.filter(r => r.status === 'accepted').length,
          rejected: allRequests.filter(r => r.status === 'rejected').length,
        };
        console.log('Calculated stats from requests:', calculatedStats);
        setStats(calculatedStats);
      } else {
        console.log('No requests data found');
        setStats({
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0
        });
      }
    } catch (error) {
      console.error('Error in fallback stats calculation:', error);
      setStats({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      });
    }
  };

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
      const response = await rentalRequestApi.updateRequestStatus(
        requestId, 
        'accepted',
        'Yêu cầu thuê của bạn đã được chấp nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất.'
      );
      
      if (response) {
        // Refresh requests and stats
        await fetchRequests();
        await fetchStats();
        toastManager.showSuccess('Đã chấp nhận yêu cầu thuê');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toastManager.showError('Có lỗi xảy ra khi chấp nhận yêu cầu');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return; // User clicked cancel
    
    try {
      const response = await rentalRequestApi.updateRequestStatus(
        requestId, 
        'rejected',
        reason || 'Rất tiếc, yêu cầu thuê của bạn không phù hợp với yêu cầu hiện tại. Cảm ơn bạn đã quan tâm.'
      );
      
      if (response) {
        // Refresh requests and stats
        await fetchRequests();
        await fetchStats();
        toastManager.showSuccess('Đã từ chối yêu cầu thuê');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toastManager.showError('Có lỗi xảy ra khi từ chối yêu cầu');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'chờ xử lý';
      case 'accepted': return 'đã chấp nhận';
      case 'rejected': return 'đã từ chối';
      default: return status;
    }
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
                  {stats?.pending || 0}
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
                  {stats?.accepted || 0}
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
                  {stats?.rejected || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
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
              Chờ xử lý ({stats?.pending || 0})
            </button>
            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã chấp nhận ({stats?.accepted || 0})
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã từ chối ({stats?.rejected || 0})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu thuê</h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus === 'all' 
                  ? 'Chưa có yêu cầu thuê nào. Hãy đăng tin để thu hút khách thuê.' 
                  : `Không có yêu cầu nào ở trạng thái "${getStatusLabel(selectedStatus)}".`
                }
              </p>
              <button 
                onClick={() => window.location.href = '/dang-tin'} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng tin cho thuê
              </button>
            </div>
          ) : (
            filteredRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={request._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.tenant?.full_name || 'Không có tên'}</h3>
                      <p className="text-sm text-gray-600">{request.tenant?.email || ''}</p>
                      <p className="text-sm text-gray-500">
                        Gửi yêu cầu lúc {formatDate(new Date(request.createdAt))}
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
                      {(() => {
                        const imageSrc = getFirstImage(request.post?.roomId?.images);
                        const safeSrc = typeof imageSrc === 'string' && imageSrc.trim() !== '' ? imageSrc : '/placeholder-room.svg';
                        return (
                          <img 
                            src={safeSrc} 
                            alt={request.post?.roomId?.title || 'Room image'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        );
                      })()}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {request.post?.roomId?.title || 'Không có tiêu đề'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.post?.roomId?.address || ''}, {request.post?.roomId?.city || ''}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {request.post?.roomId?.price ? `${request.post.roomId.price.toLocaleString()} VNĐ` : 'N/A'}
                        </p>
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
                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">{request.tenant?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">Dự kiến chuyển vào: {new Date(request.expectedMoveIn).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-gray-600">Số người: {request.tenantInfo?.numberOfPeople || 1}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tin nhắn từ người thuê:</h4>
                  <p className="text-gray-700">{request.message || 'Không có tin nhắn'}</p>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
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
          })
          )}
        </div>

      </div>
    </div>
  );
}
