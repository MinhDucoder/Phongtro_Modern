import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Statistics {
  totalPosts: number;
  activePosts: number;
  rejectedPosts: number;
}

interface LandlordInfo {
  name: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  avatar?: string;
  accountAge: number;
  statistics?: Statistics;
}

interface RoomInfo {
  title: string;
  price: number;
  area: number;
  address: string;
  description?: string;
  images?: string[];
}

interface Post {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
  landlordInfo?: LandlordInfo;
  roomInfo?: RoomInfo;
}

type PostStatus = 'pending' | 'approved' | 'rejected' | 'all';

export default function PostModerationQueue() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filter, setFilter] = useState<PostStatus>('pending');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch posts for moderation
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `/api/admin/moderation/posts?page=${page}&limit=10&status=${filter}`
      );
      
      if (response.data.success) {
        setPosts(response.data.data.posts);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        setError(response.data.message || 'Không thể tải danh sách bài đăng');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      const axiosError = err as AxiosError<any>;
      setError(axiosError.response?.data?.message || 'Lỗi khi tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle viewing post details
  const handleViewDetails = async (post: Post) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/moderation/${post.id}/get`);
      
      if (response.data.success) {
        setSelectedPost(response.data.data);
        setDetailModalOpen(true);
      } else {
        toastManager.showError(response.data.message || 'Không thể tải chi tiết bài đăng');
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
      const axiosError = err as AxiosError<any>;
      toastManager.showError(axiosError.response?.data?.message || 'Lỗi khi tải chi tiết bài đăng');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject post
  const handleModerationAction = async (postId: string, status: 'approved' | 'rejected', reason: string = '') => {
    try {
      setLoading(true);
      
      const response = await axios.patch(`/api/admin/moderation/${postId}`, {
        status,
        reason: status === 'rejected' ? reason : undefined,
        notifyLandlord: true
      });
      
      if (response.data.success) {
        toastManager.showSuccess(
          status === 'approved' 
            ? 'Bài đăng đã được duyệt thành công' 
            : 'Bài đăng đã được từ chối'
        );
        
        // Refresh posts list
        fetchPosts();
        setDetailModalOpen(false);
      } else {
        toastManager.showError(response.data.message || 'Không thể cập nhật trạng thái bài đăng');
      }
    } catch (err) {
      console.error('Error updating post status:', err);
      const axiosError = err as AxiosError<any>;
      toastManager.showError(axiosError.response?.data?.message || 'Lỗi khi cập nhật trạng thái bài đăng');
    } finally {
      setLoading(false);
    }
  };

  // Status filter options
  const filterOptions = [
    { value: 'pending', label: 'Đang chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Đã từ chối' },
    { value: 'all', label: 'Tất cả' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kiểm duyệt bài đăng</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm text-gray-500">Trạng thái:</label>
          <select
            id="status-filter"
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as PostStatus);
              setPage(1);
            }}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Post list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading && (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Lỗi tải dữ liệu</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="p-12 text-center">
            <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không có bài đăng</h3>
            <p className="text-gray-500">
              {filter === 'pending'
                ? 'Hiện không có bài đăng nào đang chờ duyệt.'
                : 'Không tìm thấy bài đăng nào với bộ lọc hiện tại.'}
            </p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin bài đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.roomInfo?.images?.[0] && (
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              src={post.roomInfo.images[0]} 
                              alt="Ảnh phòng" 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-xs text-gray-500">
                            Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{post.landlordInfo?.name}</div>
                        {post.landlordInfo?.isVerified && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Đã xác thực
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{post.roomInfo?.title}</div>
                      <div className="text-sm text-gray-500">
                        {post.roomInfo?.price?.toLocaleString('vi-VN')} đ/tháng
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.status === 'pending' ? 'Chờ duyệt' :
                         post.status === 'approved' ? 'Đã duyệt' :
                         'Đã từ chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleViewDetails(post)}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        {post.status === 'pending' && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleModerationAction(post.id, 'approved')}
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                const reason = window.prompt('Nhập lý do từ chối:');
                                if (reason) {
                                  handleModerationAction(post.id, 'rejected', reason);
                                }
                              }}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {post.status !== 'pending' && (
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => {
                              // Edit functionality if needed
                            }}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <span className="mx-4 text-sm text-gray-700">
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
          </nav>
        </div>
      )}

      {/* Post Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi tiết bài đăng"
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Post title and basic info */}
            <div>
              <h3 className="text-xl font-medium text-gray-900">{selectedPost.title}</h3>
              <div className="mt-2 flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedPost.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedPost.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedPost.status === 'pending' ? 'Chờ duyệt' :
                   selectedPost.status === 'approved' ? 'Đã duyệt' :
                   'Đã từ chối'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Ngày đăng: {new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Thông tin phòng</h4>
                <div className="rounded-md border border-gray-200 p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Giá thuê:</p>
                      <p className="font-medium text-green-600">
                        {selectedPost.roomInfo?.price?.toLocaleString('vi-VN')} đ/tháng
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diện tích:</p>
                      <p className="font-medium">{selectedPost.roomInfo?.area} m²</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ:</p>
                    <p className="font-medium">{selectedPost.roomInfo?.address}</p>
                  </div>
                  
                  {selectedPost.roomInfo?.description && (
                    <div>
                      <p className="text-sm text-gray-500">Mô tả:</p>
                      <p className="text-sm">{selectedPost.roomInfo.description}</p>
                    </div>
                  )}
                </div>

                {/* Room images */}
                {selectedPost.roomInfo?.images && selectedPost.roomInfo.images.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Hình ảnh ({selectedPost.roomInfo.images.length}):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPost.roomInfo.images.map((image: string, index: number) => (
                        <div key={index} className="relative h-20 rounded overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Ảnh phòng ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Landlord information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Thông tin người đăng</h4>
                <div className="rounded-md border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      {selectedPost.landlordInfo?.avatar ? (
                        <img 
                          src={selectedPost.landlordInfo.avatar} 
                          alt="Avatar" 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {selectedPost.landlordInfo?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedPost.landlordInfo?.name}</p>
                      <div className="flex items-center">
                        {selectedPost.landlordInfo?.isVerified ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Đã xác thực
                          </span>
                        ) : (
                          <span className="text-xs text-orange-600 flex items-center">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Chưa xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p>{selectedPost.landlordInfo?.email || 'Không có'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại:</p>
                    <p>{selectedPost.landlordInfo?.phone || 'Không có'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Thời gian tham gia:</p>
                    <p>{selectedPost.landlordInfo?.accountAge} ngày</p>
                  </div>
                </div>

                {/* Landlord post history */}
                {selectedPost.landlordInfo?.statistics && (
                  <div className="rounded-md border border-gray-200 p-4">
                    <p className="font-medium mb-2">Lịch sử đăng bài</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xl font-semibold">{selectedPost.landlordInfo.statistics.totalPosts}</p>
                        <p className="text-xs text-gray-500">Tổng bài đăng</p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-green-600">{selectedPost.landlordInfo.statistics.activePosts}</p>
                        <p className="text-xs text-gray-500">Đã duyệt</p>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-red-600">{selectedPost.landlordInfo.statistics.rejectedPosts}</p>
                        <p className="text-xs text-gray-500">Đã từ chối</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* If status is rejected, show rejection reason */}
            {selectedPost.status === 'rejected' && selectedPost.rejectionReason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="font-medium text-red-800">Lý do từ chối:</p>
                    <p className="text-red-700">{selectedPost.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setDetailModalOpen(false)}
              >
                Đóng
              </Button>
              
              {selectedPost.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const reason = window.prompt('Nhập lý do từ chối:');
                      if (reason) {
                        handleModerationAction(selectedPost.id, 'rejected', reason);
                      }
                    }}
                  >
                    Từ chối
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => handleModerationAction(selectedPost.id, 'approved')}
                  >
                    Duyệt
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}