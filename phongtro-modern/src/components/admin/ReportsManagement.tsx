'use client';

import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Report {
  id: string;
  reporter: string;
  reportedUser: string;
  reportedPost?: string;
  type: 'spam' | 'fake' | 'inappropriate' | 'harassment' | 'other';
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

// Mock data
const mockReports: Report[] = [
  {
    id: 'RPT001',
    reporter: 'Nguyễn Văn A',
    reportedUser: 'Lê Nhật Duy',
    reportedPost: 'PHÒNG TRỌ GIÁ MỀM CHỈ TỪ 3TR...',
    type: 'fake',
    reason: 'Thông tin phòng trọ không chính xác, địa chỉ sai',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'RPT002',
    reporter: 'Trần Thị B',
    reportedUser: 'Nhà Trọ Ngõ Sen',
    type: 'spam',
    reason: 'Đăng tin trùng lặp nhiều lần',
    status: 'investigating',
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'RPT003',
    reporter: 'Phạm Văn C',
    reportedUser: 'Hoàng Phúc',
    type: 'inappropriate',
    reason: 'Nội dung không phù hợp, có từ ngữ thô tục',
    status: 'resolved',
    createdAt: '2024-01-14T16:45:00Z',
    resolvedAt: '2024-01-15T08:30:00Z',
    adminNote: 'Đã xóa tin đăng và cảnh báo người dùng'
  }
];

const statusConfig = {
  pending: { label: 'Chờ xử lý', variant: 'warning' as const, icon: ClockIcon },
  investigating: { label: 'Đang điều tra', variant: 'info' as const, icon: EyeIcon },
  resolved: { label: 'Đã xử lý', variant: 'success' as const, icon: CheckCircleIcon },
  dismissed: { label: 'Bỏ qua', variant: 'error' as const, icon: XCircleIcon }
};

const typeConfig = {
  spam: { label: 'Spam', color: 'red' },
  fake: { label: 'Thông tin giả', color: 'orange' },
  inappropriate: { label: 'Nội dung không phù hợp', color: 'yellow' },
  harassment: { label: 'Quấy rối', color: 'purple' },
  other: { label: 'Khác', color: 'gray' }
};

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (reportId: string, newStatus: Report['status'], adminNote?: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: newStatus,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : report.resolvedAt,
            adminNote: adminNote || report.adminNote
          }
        : report
    ));
    setShowModal(false);
    setSelectedReport(null);
  };

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const getStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      investigating: reports.filter(r => r.status === 'investigating').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darker">Báo cáo vi phạm</h1>
          <p className="text-gray-600">Quản lý và xử lý các báo cáo vi phạm từ người dùng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-darker">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-darker">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang điều tra</p>
              <p className="text-2xl font-bold text-darker">{stats.investigating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xử lý</p>
              <p className="text-2xl font-bold text-darker">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bỏ qua</p>
              <p className="text-2xl font-bold text-darker">{stats.dismissed}</p>
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
                placeholder="Tìm kiếm theo ID, người báo cáo hoặc người bị báo cáo..."
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
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã xử lý</option>
              <option value="dismissed">Bỏ qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người bị báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại vi phạm
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
              {filteredReports.map((report) => {
                const statusInfo = statusConfig[report.status];
                const StatusIcon = statusInfo.icon;
                const typeInfo = typeConfig[report.type];
                
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-darker">{report.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-sm text-darker">{report.reporter}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-sm text-darker">{report.reportedUser}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {typeInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusInfo.variant} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<EyeIcon className="w-4 h-4" />}
                          onClick={() => openModal(report)}
                        >
                          Xem
                        </Button>
                        {report.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                          >
                            Xử lý
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-darker">Không có báo cáo nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có báo cáo vi phạm nào.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chi tiết báo cáo"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Báo cáo
                </label>
                <p className="text-sm text-darker">{selectedReport.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại vi phạm
                </label>
                <Badge variant="outline" size="sm">
                  {typeConfig[selectedReport.type].label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người báo cáo
                </label>
                <p className="text-sm text-darker">{selectedReport.reporter}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người bị báo cáo
                </label>
                <p className="text-sm text-darker">{selectedReport.reportedUser}</p>
              </div>
            </div>

            {selectedReport.reportedPost && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tin đăng bị báo cáo
                </label>
                <p className="text-sm text-darker line-clamp-2">{selectedReport.reportedPost}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do báo cáo
              </label>
              <p className="text-sm text-darker">{selectedReport.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái hiện tại
              </label>
              <Badge variant={statusConfig[selectedReport.status].variant} size="sm">
                {React.createElement(statusConfig[selectedReport.status].icon, { className: "w-3 h-3 mr-1" })}
                {statusConfig[selectedReport.status].label}
              </Badge>
            </div>

            {selectedReport.adminNote && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú của admin
                </label>
                <p className="text-sm text-darker">{selectedReport.adminNote}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </Button>
              {selectedReport.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleStatusChange(selectedReport.id, 'investigating')}
                  >
                    Bắt đầu điều tra
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleStatusChange(selectedReport.id, 'resolved', 'Đã xử lý báo cáo')}
                  >
                    Xử lý xong
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleStatusChange(selectedReport.id, 'dismissed', 'Báo cáo không có cơ sở')}
                  >
                    Bỏ qua
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
