'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  property: {
    id: string;
    title: string;
    image: string;
    address: string;
    price: string;
  };
  visitor: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  };
  datetime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  duration: number;
  createdAt: Date;
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    property: {
      id: '1',
      title: 'Phòng trọ gần ĐH Bách Khoa, full nội thất',
      image: '/placeholder-room.svg',
      address: 'Số 123, Ngõ 45, Đường Trần Khát Chân, Hai Bà Trưng, Hà Nội',
      price: '3.5 triệu/tháng',
    },
    visitor: {
      name: 'Nguyễn Thị Hoa',
      phone: '0987654321',
      email: 'hoa@email.com',
      notes: 'Muốn xem phòng vào buổi chiều',
    },
    datetime: new Date(2024, 0, 20, 14, 0),
    status: 'pending',
    duration: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    property: {
      id: '2',
      title: 'Căn hộ mini có ban công, view đẹp',
      image: '/placeholder-room.svg',
      address: 'Số 456, Phố Nguyễn Trãi, Thanh Xuân, Hà Nội',
      price: '4.2 triệu/tháng',
    },
    visitor: {
      name: 'Trần Văn Nam',
      phone: '0912345678',
      email: 'nam@email.com',
    },
    datetime: new Date(2024, 0, 21, 10, 0),
    status: 'confirmed',
    duration: 45,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Chờ xác nhận
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Đã xác nhận
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Hoàn thành
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Đã hủy
        </span>
      );
    default:
      return null;
  }
};

export default function SchedulingSystem() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' } : apt
      ));
      toast.success('Cập nhật trạng thái thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
              <p className="text-gray-600">Theo dõi và quản lý các cuộc hẹn xem phòng</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
            <div className="text-sm text-blue-600">Tổng lịch hẹn</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Chờ xác nhận</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </div>
            <div className="text-sm text-green-600">Đã xác nhận</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
            <div className="text-sm text-purple-600">Hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chờ xác nhận ({appointments.filter(apt => apt.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'confirmed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Đã xác nhận ({appointments.filter(apt => apt.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hoàn thành ({appointments.filter(apt => apt.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch hẹn nào</h3>
            <p className="text-gray-500">Khách hàng quan tâm sẽ đặt lịch xem phòng tại đây</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);

              return (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={appointment.property.image}
                        alt={appointment.property.title}
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Property Info */}
                          <Link
                            href={`/phong-tro/${appointment.property.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {appointment.property.title}
                          </Link>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span className="truncate">{appointment.property.address}</span>
                          </div>

                          {/* Visitor Info */}
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">{appointment.visitor.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <a
                                  href={`tel:${appointment.visitor.phone}`}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <PhoneIcon className="h-4 w-4" />
                                </a>
                                <Link
                                  href="/chat"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <ChatBubbleLeftIcon className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{appointment.visitor.phone}</p>
                            {appointment.visitor.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                &quot;{appointment.visitor.notes}&quot;
                              </p>
                            )}
                          </div>

                          {/* DateTime */}
                          <div className="flex items-center mt-3 space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{time} ({appointment.duration} phút)</span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="text-right ml-4">
                          <div className="flex items-center justify-end mb-3">
                            {getStatusBadge(appointment.status)}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                  disabled={isLoading}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                  disabled={isLoading}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}

                            {appointment.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                disabled={isLoading}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Hoàn thành
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt đặt lịch</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Thời gian làm việc</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Thứ 2 - Thứ 6:</span>
                <span className="text-sm font-medium">8:00 - 18:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Thứ 7 - CN:</span>
                <span className="text-sm font-medium">9:00 - 17:00</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tự động xác nhận</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2 text-sm text-gray-700">Tự động xác nhận trong giờ hành chính</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2 text-sm text-gray-700">Gửi SMS nhắc nhở</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}