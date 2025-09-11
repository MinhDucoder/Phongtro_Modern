'use client';

import { useState } from 'react';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import RoleBadge from '@/components/ui/RoleBadge';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    role: 'tenant' as 'tenant' | 'landlord',
    joinDate: '2024-01-15',
    avatar: null
  });

  const [editData, setEditData] = useState(user);

  const handleSave = () => {
    setUser(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-darker">Thông tin cá nhân</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Lưu
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar và thông tin cơ bản */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="mx-auto h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-darker">{user.name}</h2>
                  <div className="mt-2">
                    <RoleBadge role={user.role} size="lg" />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Tham gia từ {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-medium">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-medium">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-medium">{user.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Vai trò
                    </label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          editData.role === 'tenant' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="role"
                            value="tenant"
                            checked={editData.role === 'tenant'}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value as 'tenant' | 'landlord' })}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              editData.role === 'tenant' 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {editData.role === 'tenant' && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium">Người thuê</span>
                          </div>
                        </label>

                        <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          editData.role === 'landlord' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="role"
                            value="landlord"
                            checked={editData.role === 'landlord'}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value as 'tenant' | 'landlord' })}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              editData.role === 'landlord' 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {editData.role === 'landlord' && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium">Chủ nhà</span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <RoleBadge role={user.role} size="md" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
