'use client';

import { useState } from 'react';
import { 
  BellIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target: 'all' | 'users' | 'landlords' | 'specific';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  recipients?: number;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 'NOT001',
    title: 'Thông báo bảo trì hệ thống',
    content: 'Hệ thống sẽ được bảo trì từ 2:00 - 4:00 ngày 20/01/2024. Trong thời gian này, một số tính năng có thể không hoạt động bình thường.',
    type: 'warning',
    target: 'all',
    status: 'sent',
    sentAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    recipients: 12543
  },
  {
    id: 'NOT002',
    title: 'Cập nhật tính năng mới',
    content: 'Chúng tôi đã thêm tính năng tìm kiếm nâng cao và bộ lọc thông minh. Hãy trải nghiệm ngay!',
    type: 'info',
    target: 'users',
    status: 'scheduled',
    scheduledAt: '2024-01-20T09:00:00Z',
    createdAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'NOT003',
    title: 'Nhắc nhở đăng tin',
    content: 'Tin đăng của bạn sắp hết hạn. Hãy gia hạn để tiếp tục hiển thị.',
    type: 'info',
    target: 'landlords',
    status: 'draft',
    createdAt: '2024-01-15T16:45:00Z'
  }
];

const statusConfig = {
  draft: { label: 'Bản nháp', variant: 'outline' as const, icon: PencilIcon },
  scheduled: { label: 'Đã lên lịch', variant: 'warning' as const, icon: ClockIcon },
  sent: { label: 'Đã gửi', variant: 'success' as const, icon: CheckCircleIcon },
  failed: { label: 'Gửi thất bại', variant: 'error' as const, icon: XCircleIcon }
};

const typeConfig = {
  info: { label: 'Thông tin', color: 'blue' },
  warning: { label: 'Cảnh báo', color: 'yellow' },
  success: { label: 'Thành công', color: 'green' },
  error: { label: 'Lỗi', color: 'red' }
};

const targetConfig = {
  all: 'Tất cả người dùng',
  users: 'Người thuê',
  landlords: 'Chủ nhà',
  specific: 'Người dùng cụ thể'
};

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    target: 'all' as const,
    scheduledAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingNotification) {
      // Update existing notification
      setNotifications(prev => prev.map(notif => 
        notif.id === editingNotification.id 
          ? { ...notif, ...formData, status: 'draft' as const }
          : notif
      ));
    } else {
      // Create new notification
      const newNotification: Notification = {
        id: `NOT${String(notifications.length + 1).padStart(3, '0')}`,
        ...formData,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    setIsLoading(false);
    setShowModal(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target: 'all',
      scheduledAt: ''
    });
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      target: notification.target,
      scheduledAt: notification.scheduledAt || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleSend = async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, status: 'sent' as const, sentAt: new Date().toISOString(), recipients: 12543 }
        : notif
    ));
    
    setIsLoading(false);
  };

  const getStats = () => {
    return {
      total: notifications.length,
      draft: notifications.filter(n => n.status === 'draft').length,
      scheduled: notifications.filter(n => n.status === 'scheduled').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo hệ thống</h1>
          <p className="text-gray-600">Quản lý và gửi thông báo cho người dùng</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          Tạo thông báo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PencilIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã lên lịch</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã gửi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => {
                const statusInfo = statusConfig[notification.status];
                const StatusIcon = statusInfo.icon;
                const typeInfo = typeConfig[notification.type];
                
                return (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {notification.content}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {typeInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {targetConfig[notification.target]}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusInfo.variant} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
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
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<PencilIcon className="w-4 h-4" />}
                          onClick={() => handleEdit(notification)}
                        >
                          Sửa
                        </Button>
                        {notification.status === 'draft' && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
                            onClick={() => handleSend(notification.id)}
                            loading={isLoading}
                          >
                            Gửi
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<TrashIcon className="w-4 h-4" />}
                          onClick={() => handleDelete(notification.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có thông báo nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tạo thông báo đầu tiên để gửi cho người dùng.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNotification(null);
          setFormData({
            title: '',
            content: '',
            type: 'info',
            target: 'all',
            scheduledAt: ''
          });
        }}
        title={editingNotification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tiêu đề thông báo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung *
            </label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập nội dung thông báo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thông báo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="info">Thông tin</option>
                <option value="warning">Cảnh báo</option>
                <option value="success">Thành công</option>
                <option value="error">Lỗi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đối tượng
              </label>
              <select
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả người dùng</option>
                <option value="users">Người thuê</option>
                <option value="landlords">Chủ nhà</option>
                <option value="specific">Người dùng cụ thể</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lên lịch gửi (tùy chọn)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingNotification(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              {editingNotification ? 'Cập nhật' : 'Tạo thông báo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
