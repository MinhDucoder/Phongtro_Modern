'use client';

import { useState } from 'react';
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

interface Post {
  id: string;
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  category: string;
  location: string;
  price: string;
  reason?: string;
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR GẦN DƯỢC, BÁCH KHOA, NEU,...',
    author: 'Lê Nhật Duy',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    category: 'Phòng trọ',
    location: 'Hai Bà Trưng, Hà Nội',
    price: '3.8 triệu/tháng'
  },
  {
    id: '2',
    title: 'GẦN NGOẠI THƯƠNG, GTVT, HUTECH, HỒNG BÀNG, UEF, VietVision, Ga Metro',
    author: 'Nhà Trọ Ngõ Sen',
    status: 'approved',
    submittedAt: '2024-01-14T15:20:00Z',
    category: 'Phòng trọ',
    location: 'Bình Thạnh, Hồ Chí Minh',
    price: '3.3 triệu/tháng'
  },
  {
    id: '3',
    title: 'Ở ghép giường tầng sát vách DH Nguyễn Tất Thành',
    author: 'Hoàng Phúc',
    status: 'rejected',
    submittedAt: '2024-01-13T09:15:00Z',
    category: 'Ở ghép',
    location: 'Quận 4, Hồ Chí Minh',
    price: '1.3 triệu/tháng',
    reason: 'Thông tin không chính xác'
  }
];

const statusConfig = {
  pending: { label: 'Chờ duyệt', variant: 'warning' as const, icon: ClockIcon },
  approved: { label: 'Đã duyệt', variant: 'success' as const, icon: CheckCircleIcon },
  rejected: { label: 'Từ chối', variant: 'error' as const, icon: XCircleIcon }
};

export default function ModerationPanel() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            status: action === 'approve' ? 'approved' : 'rejected',
            reason: action === 'reject' ? rejectionReason : undefined
          }
        : post
    ));
    
    setIsLoading(false);
    setShowModal(false);
    setSelectedPost(null);
    setAction(null);
    setRejectionReason('');
  };

  const openModal = (post: Post, action: 'approve' | 'reject') => {
    setSelectedPost(post);
    setAction(action);
    setShowModal(true);
  };

  const getStatusCounts = () => {
    return {
      pending: posts.filter(p => p.status === 'pending').length,
      approved: posts.filter(p => p.status === 'approved').length,
      rejected: posts.filter(p => p.status === 'rejected').length,
      total: posts.length
    };
  };

  const counts = getStatusCounts();

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
              <p className="text-2xl font-bold text-darker">{counts.pending}</p>
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
              <p className="text-2xl font-bold text-darker">{counts.approved}</p>
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
              <p className="text-2xl font-bold text-darker">{counts.rejected}</p>
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
              <p className="text-2xl font-bold text-darker">{counts.total}</p>
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
              {filteredPosts.map((post) => {
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
                        >
                          Xem
                        </Button>
                        {post.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                              onClick={() => openModal(post, 'approve')}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircleIcon className="w-4 h-4" />}
                              onClick={() => openModal(post, 'reject')}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-darker">Không có tin đăng nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có tin đăng nào cần kiểm duyệt.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
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
    </div>
  );
}
