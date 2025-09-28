'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { dashboardApi } from '@/lib/api';
import { uploadImages, validateImageFile, deleteImage } from '@/lib/imageUtils';
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
    // Property type
    propertyType: 'phong_tro',
    roomType: '',
    // Post data
    options: [] as string[],
    favouriteLevel: 'free',
    status: 'pending'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!postId);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const propertyTypeOptions = [
    { value: 'phong_tro', label: 'Phòng trọ', icon: '🏠' },
    { value: 'nha_nguyen_can', label: 'Nhà nguyên căn', icon: '🏘️' },
    { value: 'can_ho_chung_cu', label: 'Căn hộ chung cư', icon: '🏢' },
    { value: 'can_ho_mini', label: 'Căn hộ mini', icon: '🏬' },
    { value: 'o_ghep', label: 'Ở ghép', icon: '👥' },
    { value: 'mat_bang', label: 'Mặt bằng', icon: '🏪' }
  ];

 

  const amenitiesOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'aircon', label: 'Điều hòa' },
    { value: 'private_wc', label: 'WC riêng' },
    { value: 'washing_machine', label: 'Máy giặt' },
    { value: 'fridge', label: 'Tủ lạnh' },
    { value: 'balcony', label: 'Ban công' }
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
          images: room.images?.map((img: any) => img.url || img) || [],
          deposit: room.deposit?.toString() || '',
          utilities: {
            electricity: room.utilities?.electricity?.toString() || '',
            water: room.utilities?.water?.toString() || '',
            internet: room.utilities?.internet?.toString() || '',
            parking: room.utilities?.parking?.toString() || ''
          },
          propertyType: room.propertyType || post.propertyType || 'phong_tro',
          roomType: room.roomType || post.roomType || '',
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
          ...(prev[parent as keyof typeof prev] as object || {}),
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxImages = 10;
    if (formData.images.length + files.length > maxImages) {
      toast.error(`Chỉ được tải lên tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate files
    const invalidFiles: string[] = [];
    const validFiles = files.filter(file => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });

    if (invalidFiles.length > 0) {
      toast.error(`Một số file không hợp lệ:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadImages(validFiles);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImages(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = formData.images[index];
    
    // Extract public_id from Cloudinary URL if it's a Cloudinary image
    if (imageUrl.includes('cloudinary.com')) {
      try {
        const urlParts = imageUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const publicId = lastPart.split('.')[0];
        
        // Try to delete from Cloudinary (optional, don't block UI if it fails)
        try {
          await deleteImage(publicId);
        } catch (error) {
          console.warn('Could not delete image from Cloudinary:', error);
        }
      } catch (error) {
        console.warn('Could not parse Cloudinary public_id:', error);
      }
    }

    // Remove from form data
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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
          },
          propertyType: formData.propertyType,
          roomType: formData.roomType || undefined
        },
        propertyType: formData.propertyType,
        roomType: formData.roomType || undefined,
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
        <h2 className="text-xl font-semibold text-black">
          {isEditing ? 'Chỉnh sửa tin đăng' : 'Tạo tin đăng mới'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tiêu đề tin đăng *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
              placeholder="Nhập tiêu đề tin đăng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Giá thuê (VNĐ/tháng) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
              placeholder="3500000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Diện tích (m²)
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tiền cọc (VNĐ)
            </label>
            <input
              type="number"
              value={formData.deposit}
              onChange={(e) => handleInputChange('deposit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
              placeholder="1000000"
            />
          </div>
        </div>

        {/* Property Type Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Loại phòng trọ *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {propertyTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.propertyType === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={option.value}
                  checked={formData.propertyType === option.value}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Room Type Selection */}
        {formData.propertyType === 'phong_tro' && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Loại phòng
            </label>
            <select
              value={formData.roomType}
              onChange={(e) => handleInputChange('roomType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn loại phòng</option>
              <option value="phong_don">Phòng đơn</option>
              <option value="phong_doi">Phòng đôi</option>
              <option value="phong_tap_the">Phòng tập thể</option>
            </select>
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Địa chỉ chi tiết *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
            placeholder="Số 123, Ngõ 45, Đường Trần Khát Chân"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
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
            <label className="block text-sm font-medium text-black mb-2">
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
            <label className="block text-sm font-medium text-black mb-2">
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
          <label className="block text-sm font-medium text-black mb-2">
            Mô tả chi tiết
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
            placeholder="Mô tả chi tiết về phòng trọ, tiện ích, khu vực xung quanh..."
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
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
                <span className="text-sm text-black">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Post Options */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tùy chọn tin đăng
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* Add post options here if needed */}
          </div>
        </div>

        {/* Utilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chi phí tiện ích (VNĐ)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Điện/kWh</label>
              <input
                type="number"
                value={formData.utilities.electricity}
                onChange={(e) => handleInputChange('utilities.electricity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                placeholder="4000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Nước/tháng</label>
              <input
                type="number"
                value={formData.utilities.water}
                onChange={(e) => handleInputChange('utilities.water', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Internet/tháng</label>
              <input
                type="number"
                value={formData.utilities.internet}
                onChange={(e) => handleInputChange('utilities.internet', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Gửi xe/tháng</label>
              <input
                type="number"
                value={formData.utilities.parking}
                onChange={(e) => handleInputChange('utilities.parking', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900"
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

          
        </div>

        {/* Images Upload Section */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Hình ảnh phòng trọ
          </label>
          
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadingImages ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải ảnh lên...</span>
              </div>
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Nhấn để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WEBP tối đa 5MB mỗi ảnh ({formData.images.length}/10)
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImages || formData.images.length >= 10}
          />

          {/* Image Preview Grid */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Ảnh đã tải ({formData.images.length}/10)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Xóa ảnh"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Ảnh đại diện
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={isLoading || uploadingImages}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo tin đăng')}
          </button>
        </div>
      </form>
    </div>
  );
}
