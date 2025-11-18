'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { chatHelpers } from '@/lib/chatApi';
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import {
  reportApi,
  Report,
  ReportStatsResponse,
  ReportStatus,
  ReportType,
  ReportTargetSummary,
} from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

const statusConfig: Record<
  ReportStatus,
  { label: string; variant: 'warning' | 'info' | 'success' | 'error'; icon: typeof ClockIcon }
> = {
  pending: { label: 'Chờ xử lý', variant: 'warning', icon: ClockIcon },
  investigating: { label: 'Đang điều tra', variant: 'info', icon: EyeIcon },
  resolved: { label: 'Đã xử lý', variant: 'success', icon: CheckCircleIcon },
  dismissed: { label: 'Bỏ qua', variant: 'error', icon: XCircleIcon },
};

const typeConfig: Record<
  ReportType,
  { label: string; color: string }
> = {
  spam: { label: 'Spam', color: 'text-red-600' },
  fake: { label: 'Thông tin giả', color: 'text-orange-600' },
  inappropriate: { label: 'Nội dung không phù hợp', color: 'text-yellow-600' },
  harassment: { label: 'Quấy rối', color: 'text-purple-600' },
  scam: { label: 'Lừa đảo', color: 'text-rose-600' },
  other: { label: 'Khác', color: 'text-gray-600' },
};

const PAGE_SIZE = 10;

const DEFAULT_MESSAGES = {
  investigating: 'Chúng tôi đang tiếp nhận và xử lý báo cáo của bạn.',
  resolvedClean:
    'Chúng tôi đã kiểm tra và chưa ghi nhận vi phạm nào. Cảm ơn bạn đã dành thời gian báo cáo.',
  resolvedRemoved:
    'Chúng tôi đã xác nhận vi phạm và gỡ bài đăng. Cảm ơn bạn đã thông báo để giữ cộng đồng an toàn.',
};

export default function ReportsManagement() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { addConversation } = useChat();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<Report | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ReportType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [isTakingDown, setIsTakingDown] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const currentUserId = authUser?._id;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await reportApi.getStats();
      if (response.success === false) {
        throw new Error(response.message || 'Không thể tải thống kê báo cáo');
      }
      setStats(response.data || null);
    } catch (error) {
      console.error(error);
      toastManager.showError(
        error instanceof Error ? error.message : 'Không thể tải thống kê báo cáo'
      );
    }
  }, []);

  const loadReportDetail = useCallback(async (reportId: string) => {
    setIsDetailLoading(true);
    try {
      const response = await reportApi.getReport(reportId);
      if (response.success !== false && response.data) {
        const detail = response.data as Report;
        setSelectedReportDetail(detail);
        setActionNote(detail.adminNote || '');
        setActionsTaken(detail.adminResolution?.actionsTaken || []);
      }
    } catch (error) {
      console.error(error);
      toastManager.showError('Không thể tải chi tiết báo cáo');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reportApi.adminList({
        page,
        limit: PAGE_SIZE,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: debouncedSearch || undefined,
      });

      if (response.success === false) {
        throw new Error(response.message || 'Không thể tải danh sách báo cáo');
      }

      setReports(response.data?.items || []);
      if (response.data?.pagination) {
        setPagination({
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        });
      }
    } catch (error) {
      console.error(error);
      toastManager.showError(
        error instanceof Error ? error.message : 'Không thể tải danh sách báo cáo'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const overviewStats = useMemo(() => {
    const base = stats?.status || {
      pending: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0,
    };
    return {
      total: stats?.total || 0,
      pending: base.pending || 0,
      investigating: base.investigating || 0,
      resolved: base.resolved || 0,
      dismissed: base.dismissed || 0,
    };
  }, [stats]);

  const handleOpenModal = (report: Report) => {
    setSelectedReport(report);
    setSelectedReportDetail(null);
    setActionNote(report.adminNote || '');
    setActionsTaken(report.adminResolution?.actionsTaken || []);
    setIsModalOpen(true);
    loadReportDetail(report._id);
  };

  const handleStatusChange = async (
    reportId: string,
    nextStatus: ReportStatus,
    overrides?: {
      adminNote?: string;
      actionsTaken?: string[];
      responseMessage?: string;
    },
    options?: { keepOpen?: boolean }
  ) => {
    setIsUpdatingStatus(true);
    try {
      const payloadActions = overrides?.actionsTaken ?? actionsTaken;
      const resolutionPayload = {
        actionsTaken: payloadActions,
        responseMessage: overrides?.responseMessage,
      };

      const response = await reportApi.updateStatus(reportId, {
        status: nextStatus,
        adminNote: overrides?.adminNote ?? actionNote,
        resolution: resolutionPayload,
      });

      if (response.success === false) {
        throw new Error(response.message || 'Không thể cập nhật báo cáo');
      }

      toastManager.showSuccess('Đã cập nhật trạng thái báo cáo');
      setReports((prev) =>
        prev.map((report) => (report._id === reportId ? (response.data as Report) || report : report))
      );
      if (response.data) {
        const updatedReport = response.data as Report;
        setSelectedReportDetail(updatedReport);
        setSelectedReport(updatedReport);
        setActionsTaken(updatedReport.adminResolution?.actionsTaken || []);
      }
      fetchStats();
      if (!options?.keepOpen) {
        setIsModalOpen(false);
    setSelectedReport(null);
        setSelectedReportDetail(null);
      }
    } catch (error) {
      toastManager.showError(
        error instanceof Error ? error.message : 'Không thể cập nhật báo cáo'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getReporterName = (report: Report) =>
    report.reporter?.full_name || report.reporter?.email || 'Ẩn danh';

  const getTargetDisplay = (report: Report) => {
    if (report.targetType === 'post') {
      return report.targetId?.title || 'Tin đăng đã bị xóa';
    }
    return report.targetId?.full_name || 'Người dùng đã bị xóa';
  };

  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString('vi-VN') : '—';

  const formatCurrency = (value?: number) =>
    typeof value === 'number'
      ? `${value.toLocaleString('vi-VN')}₫/tháng`
      : 'Chưa rõ';

  const typeBreakdown = useMemo(() => {
    if (!stats?.type) return [];
    return Object.entries(stats.type)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const ensureActions = (extra: string | string[]) => {
    const additions = Array.isArray(extra) ? extra : [extra];
    const next = Array.from(new Set([...(actionsTaken || []), ...additions]));
    setActionsTaken(next);
    return next;
  };

  const buildChatUrl = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.append(key, value);
      }
    });
    return `/chat?${query.toString()}`;
  };

  const openChatWindow = async (
    userId?: string,
    extraParams?: Record<string, string | undefined>
  ) => {
    if (!userId) {
      toastManager.showError('Không xác định được người để chat.');
      return false;
    }
    if (!currentUserId) {
      toastManager.showError('Bạn cần đăng nhập lại để sử dụng chat.');
      return false;
    }
    setIsOpeningChat(true);
    try {
      const conversation = await chatHelpers.findOrCreateConversation(currentUserId, userId);
      if (!conversation?._id) {
        throw new Error('Không lấy được cuộc trò chuyện');
      }
      addConversation(conversation);
      const url = buildChatUrl({
        conversationId: conversation._id,
        from: 'report-admin',
        ...extraParams,
      });
      router.push(url);
      toastManager.showSuccess('Đang mở cửa sổ chat...');
      return true;
    } catch (error) {
      console.error('Không thể mở chat:', error);
      toastManager.showError('Không thể mở cửa sổ chat. Vui lòng thử lại.');
      return false;
    } finally {
      setIsOpeningChat(false);
    }
  };

  const getTargetObjectId = (report?: Report | null) => {
    const target = report?.targetId as any;
    if (!target) return undefined;
    if (typeof target === 'string') return target;
    if (typeof target === 'object' && target !== null) {
      return target._id || target.id;
    }
    return undefined;
  };

  const getLandlordUserId = (report?: Report | null) => {
    if (!report || report.targetType !== 'post') return undefined;
    const target = report.targetId as any;
    if (!target) return undefined;
    const landlordField = target.landlord;
    if (!landlordField) return undefined;
    if (typeof landlordField === 'string') return landlordField;
    if (typeof landlordField === 'object') {
      return landlordField._id || landlordField.id;
    }
    return undefined;
  };

  const detailReport = selectedReportDetail || selectedReport;
  const currentReport = detailReport || selectedReport;
  const reporterId = currentReport?.reporter?._id;
  const targetEntityId = getTargetObjectId(currentReport);
  const landlordUserId = getLandlordUserId(currentReport);
  const reportLink =
    detailReport?.targetSnapshot?.url ||
    (currentReport?.targetType === 'post' &&
    (currentReport.targetId?._id || currentReport.targetId?.slug)
      ? `/phong-tro/${currentReport.targetId?._id || currentReport.targetId?.slug}`
      : undefined);
  const reporterEmail = currentReport?.reporter?.email;
  const reporterPhone = currentReport?.reporter?.phone;
  const landlordContact =
    detailReport?.targetSnapshot?.landlord ||
    (currentReport?.targetType === 'post'
      ? (currentReport.targetId as ReportTargetSummary & {
          landlord?: { name?: string; email?: string; phone?: string };
        })?.landlord
      : null);
  const canStartInvestigating = currentReport?.status === 'pending';
  const canResolve = currentReport?.status === 'investigating';

  const openReportLink = () => {
    if (!reportLink) {
      toastManager.showError('Không tìm được đường dẫn để mở bài đăng.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.open(reportLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStartInvestigation = () => {
    if (!currentReport) return;
    const nextActions = ensureActions('investigating');
    handleStatusChange(
      currentReport._id,
      'investigating',
      {
        actionsTaken: nextActions,
        responseMessage: DEFAULT_MESSAGES.investigating,
      },
      { keepOpen: true }
    );
  };

  const handleResolveClean = () => {
    if (!currentReport) return;
    const nextActions = ensureActions(['investigating', 'reviewed_no_violation']);
    handleStatusChange(currentReport._id, 'resolved', {
      actionsTaken: nextActions,
      responseMessage: DEFAULT_MESSAGES.resolvedClean,
    });
  };

  const handleContactReporter = async () => {
    if (!currentReport) return;
    const opened = await openChatWindow(reporterId, {
      reportId: currentReport._id,
      propertyId: currentReport.targetType === 'post' ? targetEntityId : undefined,
    });
    if (opened) {
      ensureActions('contact_reporter');
      return;
    }

    const subject = encodeURIComponent(`Trao đổi về báo cáo ${currentReport.code || ''}`);
    if (reporterEmail && typeof window !== 'undefined') {
      window.open(`mailto:${reporterEmail}?subject=${subject}`);
      ensureActions('contact_reporter');
      toastManager.showSuccess('Đã mở hộp thư để liên hệ người báo cáo.');
      return;
    }
    if (reporterPhone) {
      await copyToClipboard(reporterPhone, 'Đã sao chép số liên hệ của người báo cáo.');
      ensureActions('contact_reporter');
      return;
    }
    toastManager.showError('Không tìm thấy thông tin liên hệ của người báo cáo.');
  };

  const handleContactLandlord = async () => {
    if (!currentReport || currentReport.targetType !== 'post') return;
    const opened = await openChatWindow(landlordUserId, {
      propertyId: targetEntityId,
      reportId: currentReport._id,
    });
    if (opened) {
      ensureActions('contact_landlord');
      return;
    }

    const email = landlordContact?.email;
    const phone = landlordContact?.phone;
    const subject = encodeURIComponent(`Trao đổi về bài đăng ${detailReport?.targetSnapshot?.title || ''}`);
    if (email && typeof window !== 'undefined') {
      window.open(`mailto:${email}?subject=${subject}`);
      ensureActions('contact_landlord');
      toastManager.showSuccess('Đã mở hộp thư để liên hệ chủ trọ.');
      return;
    }
    if (phone) {
      await copyToClipboard(phone, 'Đã sao chép số liên hệ của chủ trọ.');
      ensureActions('contact_landlord');
      return;
    }
    toastManager.showError('Không có thông tin liên hệ của chủ trọ.');
  };


  const copyToClipboard = async (text: string, successMessage = 'Đã sao chép liên hệ vào bộ nhớ tạm') => {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      toastManager.showSuccess(successMessage);
    } catch (error) {
      toastManager.showError('Không thể sao chép thông tin. Vui lòng thử lại.');
    }
  };

  const handleTakeDownPost = async () => {
    if (!currentReport || currentReport.targetType !== 'post') return;
    setIsTakingDown(true);
    try {
      const mergedActions = ensureActions(['investigating', 'hide_post', 'contact_landlord']);
      await handleStatusChange(currentReport._id, 'resolved', {
        actionsTaken: mergedActions,
        responseMessage: DEFAULT_MESSAGES.resolvedRemoved,
      });
    } finally {
      setIsTakingDown(false);
    }
  };

  const renderTargetCard = () => {
    if (!detailReport) return null;
    const snapshot = detailReport.targetSnapshot;
    const isPost = detailReport.targetType === 'post';
    const link =
      snapshot?.url ||
      (isPost && (detailReport.targetId?._id || detailReport.targetId?.slug)
        ? `/phong-tro/${detailReport.targetId?._id || detailReport.targetId?.slug}`
        : undefined);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {isPost ? 'Thông tin bài đăng' : 'Thông tin người bị báo cáo'}
          </p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mở trang
            </a>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          {isPost ? (
            <>
              {(() => {
                const target = detailReport.targetId as
                  | (ReportTargetSummary & { roomId?: { images?: Array<{ url: string }> } })
                  | null
                  | undefined;
                const previewImage = target?.roomId?.images?.[0]?.url || '/placeholder-room.svg';
                const landlordInfo = snapshot?.landlord || target?.landlord;
                const postStatus = snapshot?.status || target?.status || 'Không rõ';

                return (
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 md:h-32 md:w-40">
                      <Image
                        src={previewImage}
                        alt={snapshot?.title || target?.title || 'Tin đăng'}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {postStatus}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            {snapshot?.title || target?.title || 'Tin đăng đã bị xóa'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {snapshot?.address ||
                              target?.roomId?.address ||
                              target?.city ||
                              'Không có địa chỉ'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Giá</p>
                          <p className="font-semibold">
                            {snapshot?.price
                              ? formatCurrency(snapshot.price)
                              : target?.price
                              ? formatCurrency(target.price)
                              : 'Chưa rõ'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Tình trạng</p>
                          <p className="font-semibold capitalize">{postStatus}</p>
                        </div>
                      </div>
                      {landlordInfo && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-sm text-gray-700">
                          <p className="font-semibold text-blue-900">Chủ trọ</p>
                          <p>Tên: {landlordInfo.name || '—'}</p>
                          <p>Email: {landlordInfo.email || '—'}</p>
                          <p>SĐT: {landlordInfo.phone || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-900">
                {snapshot?.user?.full_name || detailReport.targetId?.full_name || 'Người dùng'}
              </p>
              <p className="text-sm text-gray-600">
                Email: {snapshot?.user?.email || detailReport.targetId?.email || '—'}
              </p>
              <p className="text-sm text-gray-600">
                SĐT: {snapshot?.user?.phone || detailReport.targetId?.phone || '—'}
              </p>
              <p className="text-sm text-gray-600">
                Vai trò: {snapshot?.user?.role || detailReport.targetId?.role || '—'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darker">Báo cáo vi phạm</h1>
          <p className="text-gray-600">
            Theo dõi và xử lý các báo cáo về bài đăng hoặc người dùng
          </p>
        </div>
        <span className="text-sm text-gray-500">
          Cập nhật lần cuối: {formatDateTime(stats ? new Date().toISOString() : undefined)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-blue-50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-darker">{overviewStats.total}</p>
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
              <p className="text-2xl font-bold text-darker">{overviewStats.pending}</p>
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
              <p className="text-2xl font-bold text-darker">{overviewStats.investigating}</p>
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
              <p className="text-2xl font-bold text-darker">{overviewStats.resolved}</p>
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
              <p className="text-2xl font-bold text-darker">{overviewStats.dismissed}</p>
            </div>
          </div>
        </div>
      </div>

      {typeBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Phân bố loại vi phạm</h3>
          <div className="flex flex-wrap gap-4">
            {typeBreakdown.map(([type, count]) => (
              <div key={type} className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${typeConfig[type as ReportType].color}`}>
                  {typeConfig[type as ReportType].label}
                </span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã báo cáo, người báo cáo, đối tượng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ReportStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã xử lý</option>
              <option value="dismissed">Bỏ qua</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | ReportType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại vi phạm</option>
              {Object.entries(typeConfig).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại vi phạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-8">
                    <LoadingSpinner text="Đang tải dữ liệu..." />
                  </td>
                </tr>
              )}
              {!isLoading && reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-darker">Không có báo cáo nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                  </td>
                </tr>
              )}
              {!isLoading &&
                reports.map((report) => {
                const statusInfo = statusConfig[report.status];
                const StatusIcon = statusInfo.icon;
                const typeInfo = typeConfig[report.type];
                  const targetLabel = getTargetDisplay(report);
                return (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {report.code || report._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-darker">{getReporterName(report)}</span>
                          {report.reporter?.email && (
                            <span className="text-xs text-gray-500">{report.reporter.email}</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {report.targetType === 'post' ? (
                            <HomeIcon className="w-4 h-4 text-blue-500" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-purple-500" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm text-darker">{targetLabel}</span>
                            <span className="text-xs text-gray-500">
                              {report.targetType === 'post' ? 'Tin đăng' : 'Người dùng'}
                            </span>
                          </div>
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
                        <p>{formatDateTime(report.createdAt)}</p>
                        {report.resolvedAt && (
                          <p className="text-xs text-green-600">
                            Hoàn tất: {formatDateTime(report.resolvedAt)}
                          </p>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<EyeIcon className="w-4 h-4" />}
                            onClick={() => handleOpenModal(report)}
                        >
                          Xem
                        </Button>
                        {report.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                              onClick={() => handleOpenModal(report)}
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
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              baseUrl=""
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chi tiết báo cáo"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-5">
            {isDetailLoading && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                Đang tải thông tin chi tiết...
              </div>
            )}

            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                  <p className="text-sm text-gray-500">Mã báo cáo</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {currentReport?.code || currentReport?._id}
                  </p>
              </div>
                {currentReport && (
                  <Badge variant="outline">{typeConfig[currentReport.type].label}</Badge>
                )}
            </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                  <p className="text-sm text-gray-500">Người báo cáo</p>
                  <p className="text-base font-medium text-gray-900">{getReporterName(currentReport)}</p>
                  {currentReport?.reporter?.email && (
                    <p className="text-sm text-gray-600">{currentReport.reporter.email}</p>
                  )}
              </div>
              <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge variant={statusConfig[currentReport?.status || 'pending'].variant} size="sm">
                    {React.createElement(statusConfig[currentReport?.status || 'pending'].icon, {
                      className: 'mr-1 h-3 w-3',
                    })}
                    {statusConfig[currentReport?.status || 'pending'].label}
                  </Badge>
                  <p className="mt-1 text-sm text-gray-600">
                    Tạo: {formatDateTime(currentReport?.createdAt)}
                  </p>
                  {currentReport?.resolvedAt && (
                    <p className="text-sm text-gray-600">Hoàn tất: {formatDateTime(currentReport.resolvedAt)}</p>
                  )}
              </div>
            </div>
            </section>

            {renderTargetCard()}

            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">Nội dung báo cáo</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{currentReport?.description}</p>
            </section>

            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-700">
                Ghi chú nội bộ
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú nhanh để đội ngũ khác có thể tiếp tục xử lý..."
                />
              </label>
            </section>

            <section className="space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700">Thao tác xử lý</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={openReportLink} disabled={!reportLink}>
                  Kiểm tra bài đăng
                </Button>
              <Button
                variant="outline"
                  size="sm"
                  onClick={handleContactReporter}
                  disabled={!reporterId && !reporterEmail && !reporterPhone}
                  loading={isOpeningChat}
              >
                  Liên hệ người báo cáo
              </Button>
                {currentReport?.targetType === 'post' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContactLandlord}
                    disabled={!landlordUserId && !landlordContact}
                    loading={isOpeningChat}
                  >
                    Liên hệ chủ trọ
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {canStartInvestigating && (
                  <Button variant="ghost" onClick={handleStartInvestigation} loading={isUpdatingStatus}>
                    Bắt đầu xử lý
                  </Button>
                )}
                {canResolve && (
                  <>
                    <Button variant="primary" onClick={handleResolveClean} loading={isUpdatingStatus}>
                      Kết luận không vi phạm
                  </Button>
                    {currentReport?.targetType === 'post' && (
                  <Button
                    variant="danger"
                        onClick={handleTakeDownPost}
                        loading={isTakingDown || isUpdatingStatus}
                  >
                        Gỡ bài & gửi cảm ơn
                  </Button>
                    )}
                </>
              )}
                {currentReport?.status === 'pending' && (
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleStatusChange(currentReport._id, 'dismissed', {
                        responseMessage: 'Chúng tôi đã xem xét và từ chối báo cáo này.',
                      })
                    }
                    loading={isUpdatingStatus}
                  >
                    Bỏ qua báo cáo
                  </Button>
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
