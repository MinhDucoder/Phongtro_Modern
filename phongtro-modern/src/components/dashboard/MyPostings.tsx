'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '@/lib/api';
import PostForm from './PostForm';
import { getFirstImage } from '@/lib/imageUtils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toastManager } from '@/components/ui/ToastManager';


const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'paused', label: 'Tạm dừng' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hiển thị</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    case 'expired':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hạn</span>;
    case 'paused':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tạm dừng</span>;
    default:
      return null;
  }
};

const getPackageBadge = (packageType: string) => {
  switch (packageType) {
    case 'VIP 3':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">VIP 3</span>;
    case 'VIP 2':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">VIP 2</span>;
    case 'VIP 1':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-white">VIP 1</span>;
    default:
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">Thường</span>;
  }
};

export default function MyPostings() {
  const [postings, setPostings] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const router = useRouter();

  // Chặn duplicated fetch/toast do StrictMode (effect chạy 2 lần ở dev)
  const lastFetchRef = useRef<{ key: string; ts: number } | null>(null);
  useEffect(() => {
    setMounted(true);
    const key = `${selectedStatus}-${pagination.page}`;
    const now = Date.now();
    if (lastFetchRef.current && lastFetchRef.current.key === key && (now - lastFetchRef.current.ts) < 500) {
      return; // bỏ qua lần gọi trùng trong ~500ms
    }
    lastFetchRef.current = { key, ts: now };
    fetchPosts({ showToast: true });
  }, [selectedStatus, pagination.page]);

  // Debounce searchQuery 300ms
  useEffect(() => {
    if (!mounted) return; // Không fetch khi chưa mount
    
    const id = setTimeout(() => {
      // Khi search thay đổi, luôn quay về page 1 và fetch
      setPagination(prev => {
        const newPagination = { ...prev, page: 1 };
        // Fetch với pagination mới
        fetchPostsWithPagination(newPagination);
        return newPagination;
      });
    }, 300);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, mounted]);

  const fetchPostsWithPagination = async (paginationToUse = pagination, options?: { showToast?: boolean }) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await dashboardApi.getMyPosts({
        page: paginationToUse.page,
        limit: paginationToUse.limit,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery || undefined
      });

      if (response && response.data && response.data.posts) {
        setPostings(response.data.posts);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
        
        if (options?.showToast && response.data.posts.length > 0) {
          toastManager.showSuccess(`Đã tải ${response.data.posts.length} tin đăng`);
        }
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setLoadError(error?.message || 'Không thể tải danh sách tin đăng');
      toastManager.showError('Không thể tải danh sách tin đăng');
      setPostings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = (options?: { showToast?: boolean }) => {
    return fetchPostsWithPagination(pagination, options);
  };

  // Backend đã filter rồi, không cần filter lại ở client
  const filteredPostings = postings;

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.deletePost(id);
      if (response) {
        setPostings(prev => prev.filter(p => p._id !== id));
        toastManager.showSuccess('Xóa tin đăng thành công');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toastManager.showError('Có lỗi xảy ra khi xóa tin đăng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.renewPost(id);
      if (response) {
        // Refresh posts list
        fetchPosts();
        toastManager.showSuccess('Gia hạn tin đăng thành công');
      }
    } catch (error) {
      console.error('Error renewing post:', error);
      toastManager.showError('Có lỗi xảy ra khi gia hạn tin đăng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const posting = postings.find(p => p._id === id);
    if (!posting) return;

    const newStatus = posting.status === 'active' ? 'paused' : 'active';
    
    setIsLoading(true);
    try {
      const response = await dashboardApi.updatePostStatus(id, newStatus);
      if (response) {
        // Refresh posts list
        fetchPosts();
        toastManager.showSuccess('Cập nhật trạng thái thành công');
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingPost(id);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingPost(null);
    fetchPosts(); // Refresh the list
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingPost(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin đăng của tôi</h1>
          <p className="mt-1 text-sm text-gray-700">
            Quản lý {pagination.total || postings.length} tin đăng của bạn
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Đăng tin mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border text-gray-900">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Tìm kiếm tin đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Tổng lượt xem</p>
              <p className="text-lg font-semibold text-gray-900">
                {mounted ? postings.reduce((sum, p) => sum + (p.analytics?.views || 0), 0).toLocaleString() : postings.reduce((sum, p) => sum + (p.analytics?.views || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Lượt yêu thích</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.reduce((sum, p) => sum + (p.analytics?.likes || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <PhoneIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Số cuộc gọi</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.reduce((sum, p) => sum + (p.analytics?.calls || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FunnelIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Đang hiển thị</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading/Error/List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded bg-gray-200 h-24 w-32" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/5" />
                  <div className="h-4 bg-gray-200 rounded w-2/5" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="p-6">
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Không thể tải tin đăng</h3>
                  <p className="mt-1 text-sm text-red-700">{loadError}</p>
                  <button 
                    onClick={() => fetchPosts()} 
                    className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filteredPostings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Không có tin đăng nào</h3>
            <p className="mt-1 text-sm text-gray-700">Bắt đầu bằng cách tạo tin đăng đầu tiên của bạn.</p>
            <div className="mt-6">
              <Link
                href="/dang-tin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Đăng tin mới
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPostings.map((posting) => (
              <div
                key={posting._id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/phong-tro/${posting._id}`)}
              >
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={getFirstImage(posting.roomId?.images)}
                      alt={posting.roomId?.title || 'Room image'}
                      width={120}
                      height={90}
                      className="w-30 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(posting.status)}
                          {getPackageBadge(posting.favouriteLevel)}
                        </div>
                        
                        <Link 
                          href={`/phong-tro/${posting._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {posting.roomId?.title || 'Không có tiêu đề'}
                        </Link>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {posting.roomId?.address || ''}, {posting.roomId?.city || ''}
                        </p>
                        
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-bold text-green-600">
                            {posting.roomId?.price ? `${posting.roomId.price.toLocaleString()} VNĐ` : 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {posting.roomId?.area ? `${posting.roomId.area} m²` : 'N/A'}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center mt-3 space-x-6 text-sm text-gray-700">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {posting.analytics?.views || 0} lượt xem
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            {posting.analytics?.likes || 0} yêu thích
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {posting.analytics?.calls || 0} cuộc gọi
                          </div>
                          {posting.status === 'active' && posting.expiresAt && (() => {
                            const days = Math.ceil((new Date(posting.expiresAt).getTime() - Date.now()) / (1000*60*60*24));
                            return days <= 3 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Sắp hết hạn: {Math.max(days,0)} ngày
                              </span>
                            ) : null;
                          })()}
                        </div>

                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span>Đăng: {new Date(posting.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="mx-2">•</span>
                          <span>Cập nhật: {new Date(posting.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/dashboard/tin-dang/edit/${posting._id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>

                        {posting.status === 'expired' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenew(posting._id);
                            }}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Gia hạn"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(posting._id);
                            }}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              posting.status === 'active'
                                ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={posting.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(posting._id);
                          }}
                          disabled={isLoading}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => {
                const newPagination = { ...pagination, page: pagination.page - 1 };
                setPagination(newPagination);
                fetchPostsWithPagination(newPagination);
              }}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => {
                const newPagination = { ...pagination, page: pagination.page + 1 };
                setPagination(newPagination);
                fetchPostsWithPagination(newPagination);
              }}
              disabled={pagination.page >= pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}trong tổng số{' '}
                <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => {
                    const newPagination = { ...pagination, page: pagination.page - 1 };
                    setPagination(newPagination);
                    fetchPostsWithPagination(newPagination);
                  }}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      const newPagination = { ...pagination, page };
                      setPagination(newPagination);
                      fetchPostsWithPagination(newPagination);
                    }}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const newPagination = { ...pagination, page: pagination.page + 1 };
                    setPagination(newPagination);
                    fetchPostsWithPagination(newPagination);
                  }}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Post Modal */}
      {(showCreateForm || editingPost) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PostForm
              postId={editingPost || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Xóa tin đăng"
          message="Bạn có chắc chắn muốn xóa tin này? Hành động không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={async () => {
            const id = confirmDeleteId;
            setConfirmDeleteId(null);
            await handleDelete(id);
          }}
        />
      )}
    </div>
  );
}
