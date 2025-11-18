'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { reportApi, ReportType } from '@/lib/api';
import { toastManager } from '@/components/ui/ToastManager';

const REPORT_OPTIONS: Array<{ value: ReportType; label: string; description: string }> = [
  { value: 'spam', label: 'Spam', description: 'Tin nhắn rác, lặp lại nhiều lần' },
  { value: 'fake', label: 'Thông tin giả', description: 'Thông tin sai sự thật hoặc lừa đảo' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp', description: 'Từ ngữ thô tục hoặc hình ảnh phản cảm' },
  { value: 'harassment', label: 'Quấy rối', description: 'Có dấu hiệu đe dọa hoặc xúc phạm người khác' },
  { value: 'scam', label: 'Lừa đảo', description: 'Yêu cầu đặt cọc bất thường hoặc dấu hiệu gian lận' },
  { value: 'other', label: 'Khác', description: 'Lý do khác (ghi rõ mô tả)' },
];

export interface ReportTarget {
  targetId: string;
  targetType: 'post' | 'user';
  targetName: string;
  targetDescription?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTarget | null;
}

export default function ReportModal({ isOpen, onClose, target }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType('spam');
      setDescription('');
    }
  }, [isOpen, target]);

  const modalTitle = useMemo(() => {
    if (!target) return 'Báo cáo vi phạm';
    return target.targetType === 'post' ? 'Báo cáo tin đăng' : 'Báo cáo người dùng';
  }, [target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    const message = description.trim();
    if (message.length < 10) {
      toastManager.showError('Vui lòng mô tả chi tiết (tối thiểu 10 ký tự)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reportApi.createReport({
        targetId: target.targetId,
        targetType: target.targetType,
        type: selectedType,
        description: message,
      });

      if (response.success === false) {
        throw new Error(response.message || 'Không thể gửi báo cáo');
      }

      toastManager.showSuccess('Đã gửi báo cáo, cảm ơn bạn đã góp ý!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể gửi báo cáo ngay lúc này';
      toastManager.showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen && !!target}
      onClose={onClose}
      title={modalTitle}
      size="lg"
    >
      {target && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <p className="text-sm text-gray-500 mb-1">Đối tượng</p>
            <p className="text-base font-semibold text-gray-900">{target.targetName}</p>
            {target.targetDescription && (
              <p className="text-sm text-gray-600 mt-1">{target.targetDescription}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vi phạm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSelectedType(option.value)}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    selectedType === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              id="report-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả rõ ràng hành vi vi phạm, bằng chứng hoặc thông tin liên quan..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Vui lòng cung cấp thông tin trung thực. Báo cáo sai sự thật có thể dẫn đến khóa tài khoản.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" loading={isSubmitting} loadingText="Đang gửi...">
              Gửi báo cáo
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

