'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PostDetailModal from './EnhancedPostDetailModal';
import { toastManager } from '@/components/ui/ToastManager';

export interface Post {
  id: string;
  title: string;
  author: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  category: string;
  location: string;
  price: string;
  reason?: string;
  description: string;
  images: string[];
}

const statusConfig = {
  pending: { label: 'Chờ duyệt', variant: 'warning' as const, icon: ClockIcon },
  approved: { label: 'Đã duyệt', variant: 'success' as const, icon: CheckCircleIcon },
  rejected: { label: 'Từ chối', variant: 'error' as const, icon: XCircleIcon }
};

export default function ModerationPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Hàm fetch dữ liệu từ API
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Tạo query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/moderation?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ server');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toastManager.showError(data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toastManager.showError('Không thể tải dữ liệu bài đăng');
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component mount và khi các tham số thay đổi
  useEffect(() => {
    fetchPosts();
  }, [page, filter]);

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    fetchPosts();
  };

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    setIsLoading(true);
    
    try {
      const payload = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reason: action === 'reject' ? rejectionReason : undefined,
        notifyLandlord: true,
      };
      
      console.log('[Frontend] Sending moderation request:', { postId, payload });
      
      const response = await fetch(`/api/admin/moderation/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật trạng thái bài đăng');
      }
      
      // Hiển thị thông báo thành công
      toastManager.showSuccess(action === 'approve' ? 'Đã duyệt bài đăng' : 'Đã từ chối bài đăng');
      
      // Tải lại dữ liệu
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
      setShowActionModal(false);
      setShowDetailModal(false);
      setSelectedPost(null);
      setAction(null);
      setRejectionReason('');
    }
  };

  const openActionModal = (post: Post, actionType: 'approve' | 'reject') => {
    setSelectedPost(post);
    setAction(actionType);
    setShowActionModal(true);
  };

  const openDetailModal = (post: Post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleDetailModalStatusChange = async (postId: string, status: 'approved' | 'rejected', reason?: string, options?: any) => {
    try {
      const payload = {
        status,
        reason,
        notes: options?.notes,
        contentIssues: options?.contentIssues,
        pricingIssues: options?.pricingIssues,
        imageIssues: options?.imageIssues,
        addressIssues: options?.addressIssues,
        violationDetails: options?.violationDetails,
        notifyLandlord: true,
      };
      
      console.log('[Frontend Detail] Sending moderation request:', { postId, payload });
      
      const response = await fetch(`/api/admin/moderation/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật trạng thái bài đăng');
      }
      
      // Hiển thị thông báo thành công
      toastManager.showSuccess(status === 'approved' ? 'Đã duyệt bài đăng' : 'Đã từ chối bài đăng');
      
      // Tải lại dữ liệu
      fetchPosts();
      return;
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      throw error;
    }
  };

  // Xử lý phân trang
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darker">Kiểm duyệt tin đăng</h1>
          <p className="text-gray-600">Quản lý và kiểm duyệt tin đăng cho thuê phòng trọ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-darker">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-darker">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-darker">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-darker">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <LoadingSpinner size="md" />
                    <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-darker">Không có tin đăng nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filter !== 'all' 
                        ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                        : 'Chưa có tin đăng nào cần kiểm duyệt.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const statusInfo = statusConfig[post.status];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-darker line-clamp-2">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {post.category} • {post.location} • {post.price}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-darker">{post.author}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusInfo.variant} size="sm">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<EyeIcon className="w-4 h-4" />}
                            onClick={() => openDetailModal(post)}
                          >
                            Xem
                          </Button>
                          {post.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                                onClick={() => openActionModal(post, 'approve')}
                              >
                                Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                leftIcon={<XCircleIcon className="w-4 h-4" />}
                                onClick={() => openActionModal(post, 'reject')}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            
            <span className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={action === 'approve' ? 'Duyệt tin đăng' : 'Từ chối tin đăng'}
        size="md"
      >
        {selectedPost && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-darker mb-2">Tin đăng:</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{selectedPost.title}</p>
            </div>

            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Lý do từ chối *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập lý do từ chối tin đăng..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowActionModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant={action === 'approve' ? 'primary' : 'danger'}
                onClick={() => selectedPost && handleAction(selectedPost.id, action!)}
                disabled={isLoading || (action === 'reject' && !rejectionReason.trim())}
                loading={isLoading}
              >
                {action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Chi tiết bài đăng Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onStatusChange={handleDetailModalStatusChange}
      />
    </div>
  );
}
