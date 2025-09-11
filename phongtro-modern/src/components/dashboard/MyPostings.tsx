'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import toast from 'react-hot-toast';

// Mock data - trong thực tế sẽ fetch từ API
const mockPostings = [
  {
    id: '1',
    title: 'Phòng trọ gần ĐH Bách Khoa, full nội thất, giá tốt',
    price: '3.5 triệu/tháng',
    area: '25 m²',
    location: 'Hai Bà Trưng, Hà Nội',
    address: 'Số 123, Ngõ 45, Đường Trần Khát Chân',
    images: ['/placeholder-room.svg'],
    status: 'active',
    views: 234,
    likes: 12,
    calls: 8,
    posted: '2024-01-15',
    expires: '2024-02-15',
    package: 'VIP 1',
  },
  {
    id: '2',
    title: 'Căn hộ mini 1PN, có ban công, gần chợ, siêu thị',
    price: '4.2 triệu/tháng',
    area: '35 m²',
    location: 'Thanh Xuân, Hà Nội',
    address: 'Số 456, Phố Nguyễn Trãi',
    images: ['/placeholder-room.svg'],
    status: 'pending',
    views: 89,
    likes: 5,
    calls: 2,
    posted: '2024-01-18',
    expires: '2024-02-18',
    package: 'Thường',
  },
  {
    id: '3',
    title: 'Phòng trọ giá rẻ, gần trường ĐH Kinh tế Quốc dân',
    price: '2.8 triệu/tháng',
    area: '20 m²',
    location: 'Đống Đa, Hà Nội',
    address: 'Số 789, Đường Giải Phóng',
    images: ['/placeholder-room.svg'],
    status: 'expired',
    views: 567,
    likes: 23,
    calls: 15,
    posted: '2024-01-01',
    expires: '2024-01-31',
    package: 'VIP 2',
  },
  {
    id: '4',
    title: 'Nhà nguyên căn 2PN, có sân để xe, gần trường học',
    price: '8.5 triệu/tháng',
    area: '60 m²',
    location: 'Long Biên, Hà Nội',
    address: 'Số 321, Phố Ngọc Thụy',
    images: ['/placeholder-room.svg'],
    status: 'paused',
    views: 156,
    likes: 9,
    calls: 6,
    posted: '2024-01-12',
    expires: '2024-02-12',
    package: 'VIP 1',
  },
];

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
  const [postings, setPostings] = useState(mockPostings);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPostings = postings.filter(posting => {
    const matchesStatus = selectedStatus === 'all' || posting.status === selectedStatus;
    const matchesSearch = posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         posting.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPostings(prev => prev.filter(p => p.id !== id));
      toast.success('Xóa tin đăng thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPostings(prev => prev.map(p => 
        p.id === id 
          ? { ...p, status: 'active', expires: '2024-03-15' }
          : p
      ));
      toast.success('Gia hạn tin đăng thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPostings(prev => prev.map(p => 
        p.id === id 
          ? { ...p, status: p.status === 'active' ? 'paused' : 'active' }
          : p
      ));
      toast.success('Cập nhật trạng thái thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin đăng của tôi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý {postings.length} tin đăng của bạn
          </p>
        </div>
        <Link
          href="/dang-tin"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Đăng tin mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tin đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <p className="text-sm font-medium text-gray-500">Tổng lượt xem</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
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
              <p className="text-sm font-medium text-gray-500">Lượt yêu thích</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.reduce((sum, p) => sum + p.likes, 0)}
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
              <p className="text-sm font-medium text-gray-500">Số cuộc gọi</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.reduce((sum, p) => sum + p.calls, 0)}
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
              <p className="text-sm font-medium text-gray-500">Đang hiển thị</p>
              <p className="text-lg font-semibold text-gray-900">
                {postings.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Postings List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredPostings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Không có tin đăng nào</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo tin đăng đầu tiên của bạn.</p>
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
              <div key={posting.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={posting.images[0]}
                      alt={posting.title}
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
                          {getPackageBadge(posting.package)}
                        </div>
                        
                        <Link 
                          href={`/phong-tro/${posting.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {posting.title}
                        </Link>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {posting.address}, {posting.location}
                        </p>
                        
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-bold text-green-600">
                            {posting.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            {posting.area}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center mt-3 space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {posting.views} lượt xem
                          </div>
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            {posting.likes} yêu thích
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {posting.calls} cuộc gọi
                          </div>
                        </div>

                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span>Đăng: {new Date(posting.posted).toLocaleDateString('vi-VN')}</span>
                          <span className="mx-2">•</span>
                          <span>Hết hạn: {new Date(posting.expires).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/dashboard/tin-dang/edit/${posting.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>

                        {posting.status === 'expired' ? (
                          <button
                            onClick={() => handleRenew(posting.id)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Gia hạn"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(posting.id)}
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
                          onClick={() => handleDelete(posting.id)}
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
    </div>
  );
}
