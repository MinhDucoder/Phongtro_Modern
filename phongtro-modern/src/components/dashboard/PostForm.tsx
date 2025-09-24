'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { dashboardApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PostFormProps {
  postId?: string; // If provided, we're editing; otherwise creating
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PostForm({ postId, onSuccess, onCancel }: PostFormProps) {
  const [formData, setFormData] = useState({
    // Room data
    title: '',
    description: '',
    price: '',
    area: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    amenities: [] as string[],
    images: [] as string[],
    deposit: '',
    utilities: {
      electricity: '',
      water: '',
      internet: '',
      parking: ''
    },
    // Post data
    options: [] as string[],
    favouriteLevel: 'free',
    status: 'pending'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!postId);

  const amenitiesOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'aircon', label: 'Điều hòa' },
    { value: 'private_wc', label: 'WC riêng' },
    { value: 'washing_machine', label: 'Máy giặt' },
    { value: 'fridge', label: 'Tủ lạnh' },
    { value: 'balcony', label: 'Ban công' }
  ];

  const postOptions = [
    { value: 'aircon', label: 'Điều hòa' },
    { value: 'washing_machine', label: 'Máy giặt' },
    { value: 'balcony', label: 'Ban công' },
    { value: 'window', label: 'Cửa sổ' },
    { value: 'fridge', label: 'Tủ lạnh' },
    { value: 'kitchen', label: 'Bếp' }
  ];

  const favouriteLevels = [
    { value: 'free', label: 'Miễn phí' },
    { value: 'silver', label: 'Bạc' },
    { value: 'gold', label: 'Vàng' },
    { value: 'platinum', label: 'Bạch kim' }
  ];

  useEffect(() => {
    if (isEditing && postId) {
      loadPostData();
    }
  }, [postId, isEditing]);

  const loadPostData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.getPostById(postId!);
      if (response && response.data) {
        const post = response.data;
        const room = post.roomId;
        
        setFormData({
          title: room.title || '',
          description: room.description || '',
          price: room.price?.toString() || '',
          area: room.area?.toString() || '',
          address: room.address || '',
          city: room.city || '',
          district: room.district || '',
          ward: room.ward || '',
          amenities: room.amenities || [],
          images: room.images || [],
          deposit: room.deposit?.toString() || '',
          utilities: {
            electricity: room.utilities?.electricity?.toString() || '',
            water: room.utilities?.water?.toString() || '',
            internet: room.utilities?.internet?.toString() || '',
            parking: room.utilities?.parking?.toString() || ''
          },
          options: post.options || [],
          favouriteLevel: post.favouriteLevel || 'free',
          status: post.status || 'pending'
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Không thể tải thông tin tin đăng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayToggle = (field: 'amenities' | 'options', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        room: {
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          area: parseInt(formData.area) || 0,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          amenities: formData.amenities,
          images: formData.images,
          deposit: parseInt(formData.deposit) || 0,
          utilities: {
            electricity: parseInt(formData.utilities.electricity) || 0,
            water: parseInt(formData.utilities.water) || 0,
            internet: parseInt(formData.utilities.internet) || 0,
            parking: parseInt(formData.utilities.parking) || 0
          }
        },
        options: formData.options,
        favouriteLevel: formData.favouriteLevel,
        status: formData.status
      };

      let response;
      if (isEditing) {
        response = await dashboardApi.updatePost(postId!, postData);
      } else {
        response = await dashboardApi.createPost(postData);
      }

      if (response) {
        toast.success(isEditing ? 'Cập nhật tin đăng thành công' : 'Tạo tin đăng thành công');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(isEditing ? 'Có lỗi xảy ra khi cập nhật tin đăng' : 'Có lỗi xảy ra khi tạo tin đăng');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Chỉnh sửa tin đăng' : 'Tạo tin đăng mới'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề tin đăng *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề tin đăng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá thuê (VNĐ/tháng) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3500000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diện tích (m²)
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiền cọc (VNĐ)
            </label>
            <input
              type="number"
              value={formData.deposit}
              onChange={(e) => handleInputChange('deposit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ chi tiết *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Số 123, Ngõ 45, Đường Trần Khát Chân"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành phố
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hà Nội"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hai Bà Trưng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phường/Xã
            </label>
            <input
              type="text"
              value={formData.ward}
              onChange={(e) => handleInputChange('ward', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bách Khoa"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chi tiết về phòng trọ, tiện ích, khu vực xung quanh..."
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiện ích có sẵn
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenitiesOptions.map((amenity) => (
              <label key={amenity.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity.value)}
                  onChange={() => handleArrayToggle('amenities', amenity.value)}
                  className="mr-2"
                />
                <span className="text-sm">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Post Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tùy chọn tin đăng
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {postOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.options.includes(option.value)}
                  onChange={() => handleArrayToggle('options', option.value)}
                  className="mr-2"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chi phí tiện ích (VNĐ)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Điện/kWh</label>
              <input
                type="number"
                value={formData.utilities.electricity}
                onChange={(e) => handleInputChange('utilities.electricity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nước/tháng</label>
              <input
                type="number"
                value={formData.utilities.water}
                onChange={(e) => handleInputChange('utilities.water', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Internet/tháng</label>
              <input
                type="number"
                value={formData.utilities.internet}
                onChange={(e) => handleInputChange('utilities.internet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gửi xe/tháng</label>
              <input
                type="number"
                value={formData.utilities.parking}
                onChange={(e) => handleInputChange('utilities.parking', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Post Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gói tin đăng
            </label>
            <select
              value={formData.favouriteLevel}
              onChange={(e) => handleInputChange('favouriteLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {favouriteLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hiển thị</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Tính năng upload hình ảnh sẽ được thêm sau
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo tin đăng')}
          </button>
        </div>
      </form>
    </div>
  );
}
