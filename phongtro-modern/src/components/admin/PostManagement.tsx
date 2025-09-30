'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

interface Post {
  _id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  property_type: string;
  room_type: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  is_featured: boolean;
  created_at: string;
  createdAt: string;
  updated_at: string;
  landlord: {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  roomId: {
    _id: string;
    title: string;
    address: string;
    price: number;
    images: string[];
    area: number;
    status: string;
  };
  images: string[];
  view_count: number;
  favorite_count: number;
}

interface PostStatistics {
  totalPosts: number;
  activePosts: number;
  pendingPosts: number;
  expiredPosts: number;
  freePosts: number;
  silverPosts: number;
  goldPosts: number;
  platinumPosts: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      limit: number;
    };
    statistics: PostStatistics;
  };
  message?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Đang hoạt động
                  </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-3 w-3 mr-1" />
          Chờ duyệt
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
                    Từ chối
                  </span>
      );
    case 'inactive':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Không hoạt động
        </span>
      );
    default:
        return null;
  }
};

const getPropertyTypeBadge = (type: string) => {
  if (!type) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <HomeIcon className="h-3 w-3 mr-1" />
      Không xác định
    </span>
  );

  const normalizedType = type.toLowerCase().trim();
  
  switch (normalizedType) {
    case 'phong_tro':
    case 'phong tro':
    case 'phòng trọ':
    case 'phòng tro':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <HomeIcon className="h-3 w-3 mr-1" />
          Phòng trọ
        </span>
      );
    case 'can_ho':
    case 'can ho':
    case 'căn hộ':
    case 'căn ho':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
          Căn hộ
        </span>
      );
    case 'nha_nguyen_can':
    case 'nha nguyen can':
    case 'nhà nguyên căn':
    case 'nhà nguyên can':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <HomeIcon className="h-3 w-3 mr-1" />
          Nhà nguyên căn
        </span>
      );
    case 'chung_cu':
    case 'chung cu':
    case 'chung cư':
    case 'chung cu':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
          Chung cư
        </span>
      );
    case 'nha_tro':
    case 'nha tro':
    case 'nhà trọ':
    case 'nhà tro':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
          <HomeIcon className="h-3 w-3 mr-1" />
          Nhà trọ
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <HomeIcon className="h-3 w-3 mr-1" />
          {type}
        </span>
      );
  }
};

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<PostStatistics>({
    totalPosts: 0,
    activePosts: 0,
    pendingPosts: 0,
    expiredPosts: 0,
    freePosts: 0,
    silverPosts: 0,
    goldPosts: 0,
    platinumPosts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    // Debounce search term
    const handler = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });

      const response = await fetch(`/api/admin/posts?${params}`, {
        credentials: 'include'
      });
      
      const data: ApiResponse = await response.json();

      if (data.success) {
        console.log('Posts data:', data.data.posts);
        console.log('First post:', data.data.posts[0]);
        console.log('First post price:', data.data.posts[0]?.price);
        console.log('First post roomId price:', data.data.posts[0]?.roomId?.price);
        console.log('First post createdAt:', data.data.posts[0]?.createdAt);
        console.log('First post created_at:', data.data.posts[0]?.created_at);
        console.log('First post title:', data.data.posts[0]?.title);
        console.log('First post property_type:', data.data.posts[0]?.property_type);
        console.log('First post room_type:', data.data.posts[0]?.room_type);
        console.log('First post roomId:', data.data.posts[0]?.roomId);
        console.log('All posts property types:', data.data.posts.map(p => ({ id: p._id, property_type: p.property_type, room_type: p.room_type })));
        setPosts(data.data.posts);
        setStats(data.data.statistics);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toastManager.showError(data.message || 'Lỗi khi tải danh sách tin đăng');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toastManager.showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectOne = (postId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map(p => p._id)));
    }
  };

  const bulkUpdateStatus = async (status: 'active' | 'rejected') => {
    if (selectedIds.size === 0) {
      toastManager.showError('Vui lòng chọn ít nhất 1 tin');
      return;
    }
    try {
      const ids = Array.from(selectedIds);
      let success = 0;
      for (const id of ids) {
        const res = await fetch(`/api/admin/posts/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data?.success) success += 1;
      }
      toastManager.showSuccess(`Đã cập nhật ${success}/${ids.length} tin`);
      setSelectedIds(new Set());
      fetchPosts();
    } catch (e) {
      toastManager.showError('Không thể cập nhật hàng loạt');
    }
  };

  const handleStatusChange = async (post: Post) => {
    try {
      const response = await fetch(`/api/admin/posts/${post._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        toastManager.showSuccess('Đã cập nhật trạng thái tin đăng');
        fetchPosts();
        setShowStatusModal(false);
        setNewStatus('');
      } else {
        toastManager.showError(data.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError('Lỗi khi cập nhật trạng thái tin đăng');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          toastManager.showSuccess('Đã xóa tin đăng thành công');
          fetchPosts();
        } else {
          toastManager.showError(data.message || 'Không thể xóa tin đăng');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        toastManager.showError('Lỗi kết nối server');
      }
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không hợp lệ';
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tin đăng</h1>
          <p className="text-gray-600 mt-2">Quản lý và kiểm duyệt tin đăng bất động sản</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm tin đăng
        </button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Tổng tin đăng</div>
            </div>
          </div>
          </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activePosts}</div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
          </div>
          </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingPosts}</div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
          </div>
          </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
              <div className="text-2xl font-bold text-gray-900">{stats.expiredPosts}</div>
              <div className="text-sm text-gray-600">Hết hạn</div>
            </div>
          </div>
        </div>
          </div>

      {/* Filters & Bulk actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
              <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            </div>

          {/* Status Filter */}
            <div>
              <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="inactive">Không hoạt động</option>
              </select>
            </div>

          {/* Type Filter */}
            <div>
              <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="phong_tro">Phòng trọ</option>
              <option value="can_ho">Căn hộ</option>
              <option value="nha_nguyen_can">Nhà nguyên căn</option>
            </select>
            </div>
        {posts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              {selectedIds.size === posts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              onClick={() => bulkUpdateStatus('active')}
              className="px-3 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
            >
              Duyệt (kích hoạt)
            </button>
            <button
              onClick={() => bulkUpdateStatus('rejected')}
              className="px-3 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
            >
              Từ chối
            </button>
            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-600">Đã chọn {selectedIds.size} tin</span>
            )}
          </div>
        )}
        </div>
              </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" aria-label="select-all" onChange={toggleSelectAll} checked={posts.length>0 && selectedIds.size===posts.length} className="mr-3 align-middle" />
                  Tin đăng
                </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
                </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy tin đăng nào
                    </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3"
                          checked={selectedIds.has(post._id)}
                          onChange={() => toggleSelectOne(post._id)}
                          aria-label="select-row"
                        />
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          {post.images && post.images.length > 0 ? (
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <HomeIcon className="h-6 w-6 text-gray-400" />
                          )}
                      </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {post.title || post.roomId?.title || 'Không có tiêu đề'}
          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {post.address || post.roomId?.address || 'Không có địa chỉ'}, {post.ward}, {post.district}, {post.city}
              </div>
                          <div className="text-xs text-gray-400">
                            {post.area || post.roomId?.area || 0}m²
            </div>
        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPropertyTypeBadge(post.property_type || post.room_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(post.price || post.roomId?.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post?.landlord && (post as any).landlord?.avatar ? (
                          <img
                            src={(post as any).landlord.avatar}
                            alt={post.landlord.full_name || 'User'}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {post.landlord?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{post.landlord?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{post.landlord?.phone || 'N/A'}</div>
                      </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt || post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={async () => {
                                setSelectedPost(post);
                                setNewStatus('active');
                                await handleStatusChange(post);
                              }}
                              className="px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                              title="Duyệt tin"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={async () => {
                                setSelectedPost(post);
                                setNewStatus('rejected');
                                await handleStatusChange(post);
                              }}
                              className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                              title="Từ chối"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setNewStatus(post.status === 'active' ? 'inactive' : 'active');
                            setShowStatusModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            post.status === 'active'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={post.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        >
                          {post.status === 'active' ? (
                            <XCircleIcon className="h-4 w-4" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                  </button>

                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-4 w-4" />
                    </button>

                    <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
              </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tin đăng</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
                <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                  </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Logic to center current page
                  let pageNum = page;
                  if (page < 3) {
                    pageNum = i + 1;
                  } else if (page > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                    <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pageNum === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                    >
                        {pageNum}
                    </button>
                    );
                  }
                  return null;
                })}
                  <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FunnelIcon className="h-6 w-6 text-blue-600" />
                      </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Thay đổi trạng thái tin đăng
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Thay đổi trạng thái của tin đăng "{selectedPost.title}"
                          </p>
                        </div>
                    <div className="mt-4">
                      <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">Trạng thái mới</label>
                      <select
                        id="status-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Từ chối</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                      </div>
                      </div>
                        </div>
                      </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => selectedPost && handleStatusChange(selectedPost)}
                  >
                  Cập nhật
                  </button>
                    <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                  }}
                >
                  Hủy
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
