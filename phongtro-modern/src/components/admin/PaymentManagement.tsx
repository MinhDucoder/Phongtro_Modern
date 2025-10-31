'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toastManager } from '@/components/ui/ToastManager';

interface Payment {
  id: string;
  transactionId: string;
  referenceId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  packageName: string;
  packageType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  packageDuration: number;
  packageStartDate?: string;
  packageEndDate?: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  notes?: string;
}

interface PaymentStats {
  overview: {
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    avgTransactionValue: number;
  };
  revenueByPackage: Array<{
    packageType: string;
    revenue: number;
    count: number;
    avgValue: number;
  }>;
  revenueByMethod: Array<{
    method: string;
    revenue: number;
    count: number;
  }>;
}

const statusConfig = {
  pending: { label: 'Chờ xử lý', variant: 'warning' as const, icon: ClockIcon },
  completed: { label: 'Thành công', variant: 'success' as const, icon: CheckCircleIcon },
  failed: { label: 'Thất bại', variant: 'error' as const, icon: XCircleIcon },
  refunded: { label: 'Hoàn tiền', variant: 'info' as const, icon: XCircleIcon }
};

const methodConfig: Record<string, string> = {
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  zalopay: 'Ví ZaloPay',
  vnpay: 'VNPay',
  paypal: 'PayPal',
  cash: 'Tiền mặt'
};

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const limit = 20;

  // Fetch payments từ API
  useEffect(() => {
    fetchPayments();
    // fetchStats(); // Tạm thời comment để test
  }, [page, filter, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('Fetching payments with URL:', `/api/v1/admin/payments?${params}`);

      const response = await fetch(`/api/v1/admin/payments?${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API returned ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('Payment data received:', result);

      if (result.success && result.data) {
        setPayments(result.data.payments || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        console.error('Invalid response format:', result);
        toastManager.showError(result.message || 'Không thể tải danh sách giao dịch');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      const message = error instanceof Error ? error.message : String(error);
      toastManager.showError('Lỗi khi tải dữ liệu giao dịch: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/payments/overview', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchPayments();
    // fetchStats(); // Tạm thời comment
  };

  const handleViewDetail = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/payments/${paymentId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Không thể lấy chi tiết giao dịch');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSelectedPayment(result.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      toastManager.showError('Lỗi khi lấy chi tiết giao dịch');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darker">Quản lý thanh toán</h1>
          <p className="text-gray-600">Theo dõi và quản lý các giao dịch thanh toán</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Stats - Tạm thời ẩn để debug */}
      {false && stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-darker">{stats?.overview?.totalPayments ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thành công</p>
                <p className="text-2xl font-bold text-darker">{stats?.overview?.completedPayments ?? 0}</p>
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
                <p className="text-2xl font-bold text-darker">{stats?.overview?.pendingPayments ?? 0}</p>
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
                <p className="text-2xl font-bold text-darker">{stats?.overview?.failedPayments ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng thu</p>
                <p className="text-xl font-bold text-darker">
                  {formatCurrency(stats?.overview?.totalRevenue ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID hoặc tên người dùng..."
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
              <option value="completed">Thành công</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Giao dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gói dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="flex justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="text-center">
                      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-darker">Không có giao dịch nào</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || filter !== 'all' 
                          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                          : 'Chưa có giao dịch thanh toán nào.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const statusInfo = statusConfig[payment.status];
                  const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-darker">{payment.transactionId}</p>
                        {payment.referenceId && (
                          <p className="text-xs text-gray-500">Ref: {payment.referenceId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-darker">
                          {payment.user?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{payment.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Badge variant="info" size="sm">
                          {payment.packageName}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{payment.packageDuration} ngày</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-darker">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-darker">
                        {methodConfig[payment.paymentMethod] || payment.paymentMethod}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusInfo.variant} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(payment.createdAt)}</p>
                        {payment.completedAt && (
                          <p className="text-xs text-green-600">
                            Hoàn thành: {formatDate(payment.completedAt)}
                          </p>
                        )}
                        {payment.failedAt && (
                          <p className="text-xs text-red-600">
                            Thất bại: {formatDate(payment.failedAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<EyeIcon className="w-4 h-4" />}
                          onClick={() => handleViewDetail(payment.id)}
                        >
                          Xem
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && payments.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Details - Tạm thời ẩn */}
      {false && (stats?.revenueByPackage?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue by Package Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-darker mb-4">Doanh thu theo gói</h3>
            <div className="space-y-3">
              {(stats?.revenueByPackage ?? []).map((pkg) => (
                <div key={pkg.packageType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-darker">{pkg.packageType.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">{pkg.count} giao dịch</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-darker">{formatCurrency(pkg.revenue)}</p>
                    <p className="text-xs text-gray-600">TB: {formatCurrency(pkg.avgValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-darker mb-4">Doanh thu theo phương thức</h3>
            <div className="space-y-3">
              {(stats?.revenueByMethod ?? []).map((method) => (
                <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-darker">
                      {methodConfig[method.method] || method.method}
                    </p>
                    <p className="text-sm text-gray-600">{method.count} giao dịch</p>
                  </div>
                  <p className="font-bold text-darker">{formatCurrency(method.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-darker">Chi tiết giao dịch thanh toán</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Thông tin giao dịch cơ bản */}
              <div>
                <h3 className="text-lg font-semibold text-darker mb-3">Thông tin giao dịch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Mã giao dịch</p>
                    <p className="text-sm font-mono text-darker mt-1">{selectedPayment.transactionId}</p>
                  </div>
                  {selectedPayment.referenceId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Mã tham chiếu</p>
                      <p className="text-sm font-mono text-darker mt-1">{selectedPayment.referenceId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Trạng thái</p>
                    <div className="mt-1">
                      <Badge variant={statusConfig[selectedPayment.status].variant} size="sm">
                        {statusConfig[selectedPayment.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Phương thức</p>
                    <p className="text-sm text-darker mt-1">
                      {methodConfig[selectedPayment.paymentMethod] || selectedPayment.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin người dùng */}
              {selectedPayment.user && (
                <div>
                  <h3 className="text-lg font-semibold text-darker mb-3">Thông tin người dùng</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Tên</p>
                      <p className="text-sm text-darker mt-1">{selectedPayment.user.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                      <p className="text-sm text-darker mt-1">{selectedPayment.user.email}</p>
                    </div>
                    {selectedPayment.user.phone && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Số điện thoại</p>
                        <p className="text-sm text-darker mt-1">{selectedPayment.user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Thông tin gói dịch vụ */}
              <div>
                <h3 className="text-lg font-semibold text-darker mb-3">Thông tin gói dịch vụ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Tên gói</p>
                    <p className="text-sm text-darker mt-1">{selectedPayment.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Loại gói</p>
                    <p className="text-sm text-darker mt-1">{selectedPayment.packageType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Thời hạn</p>
                    <p className="text-sm text-darker mt-1">{selectedPayment.packageDuration} ngày</p>
                  </div>
                  {selectedPayment.packageStartDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</p>
                      <p className="text-sm text-darker mt-1">{formatDate(selectedPayment.packageStartDate)}</p>
                    </div>
                  )}
                  {selectedPayment.packageEndDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</p>
                      <p className="text-sm text-darker mt-1">{formatDate(selectedPayment.packageEndDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div>
                <h3 className="text-lg font-semibold text-darker mb-3">Thông tin thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Số tiền</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Loại tiền</p>
                    <p className="text-sm text-darker mt-1">{selectedPayment.currency}</p>
                  </div>
                </div>
              </div>

              {/* Thời gian xử lý */}
              <div>
                <h3 className="text-lg font-semibold text-darker mb-3">Thời gian</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
                    <p className="text-sm text-darker">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  {selectedPayment.completedAt && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                      <p className="text-sm text-green-600 font-medium">{formatDate(selectedPayment.completedAt)}</p>
                    </div>
                  )}
                  {selectedPayment.failedAt && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-600">Thất bại</p>
                      <p className="text-sm text-red-600 font-medium">{formatDate(selectedPayment.failedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              {selectedPayment.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-darker mb-3">Ghi chú</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-darker">{selectedPayment.notes}</p>
                  </div>
                </div>
              )}

              {/* Lý do thất bại */}
              {selectedPayment.failureReason && (
                <div>
                  <h3 className="text-lg font-semibold text-darker mb-3">Lý do thất bại</h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">{selectedPayment.failureReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
