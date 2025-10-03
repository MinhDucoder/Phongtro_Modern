'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CalendarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface PaymentRecord {
  id: string;
  packageName: string;
  packageType: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  transactionId: string;
  referenceId?: string;
  packageStartDate: Date | string;
  packageEndDate: Date | string;
  packageDuration: number;
  invoiceUrl?: string;
  notes?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
  failedAt?: Date | string;
  failureReason?: string;
  gatewayResponse?: any;
}

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onDownloadInvoice: (payment: PaymentRecord) => void;
}

export default function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onDownloadInvoice,
}: PaymentDetailModalProps) {
  if (!payment) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircleIcon className="h-8 w-8 text-green-600" />,
          text: 'Thành công',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
        };
      case 'pending':
        return {
          icon: <ClockIcon className="h-8 w-8 text-yellow-600" />,
          text: 'Đang xử lý',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
        };
      case 'failed':
        return {
          icon: <XCircleIcon className="h-8 w-8 text-red-600" />,
          text: 'Thất bại',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
        };
      default:
        return {
          icon: <ClockIcon className="h-8 w-8 text-gray-600" />,
          text: status,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
        };
    }
  };

  const statusInfo = getStatusInfo(payment.status);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    Chi tiết giao dịch
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Status Section */}
                <div className={`${statusInfo.bgColor} rounded-lg p-6 mb-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {statusInfo.icon}
                      <div>
                        <p className="text-sm text-gray-600">Trạng thái</p>
                        <p className={`text-xl font-bold ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Số tiền</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      Thông tin gói
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Tên gói</p>
                            <p className="font-semibold text-gray-900">{payment.packageName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Thời hạn</p>
                            <p className="font-semibold text-gray-900">
                              {payment.packageDuration} ngày
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      Thông tin giao dịch
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Mã giao dịch</span>
                        <span className="font-mono font-medium text-gray-900">
                          {payment.transactionId}
                        </span>
                      </div>
                      {payment.referenceId && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Mã tham chiếu</span>
                          <span className="font-mono font-medium text-gray-900">
                            {payment.referenceId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phương thức thanh toán</span>
                        <span className="font-medium text-gray-900">{payment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Ngày tạo</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      {payment.completedAt && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Ngày hoàn thành</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(payment.completedAt)}
                          </span>
                        </div>
                      )}
                      {payment.failedAt && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Ngày thất bại</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(payment.failedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Duration */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      Thời gian hiệu lực
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(payment.packageStartDate)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(payment.packageEndDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Failure Reason */}
                  {payment.status === 'failed' && payment.failureReason && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                        Lý do thất bại
                      </h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{payment.failureReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {payment.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                        Ghi chú
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900">{payment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  {payment.invoiceUrl && (
                    <button
                      onClick={() => onDownloadInvoice(payment)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Tải hóa đơn
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
