import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toastManager } from '@/components/ui/ToastManager';

export interface PostDetail {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  location: string;
  price: string;
  category: string;
  images: string[];
  reason?: string;
}

interface PostDetailModalProps {
  post: PostDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (postId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
}

export default function PostDetailModal({ post, isOpen, onClose, onStatusChange }: PostDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (!post) return;
    
    try {
      setIsSubmitting(true);
      
      // Kiểm tra nếu từ chối nhưng không có lý do
      if (status === 'rejected') {
        const reason = rejectionReason.trim();
        if (!reason) {
        toastManager.showError('Vui lòng nhập lý do từ chối bài đăng');
          reasonRef.current?.focus();
          setIsSubmitting(false);
          return;
        }
        await onStatusChange(post.id, status, reason);
      } else {
        await onStatusChange(post.id, status);
      }
      
      toastManager.showSuccess(
        status === 'approved' 
          ? 'Đã phê duyệt bài đăng thành công' 
          : 'Đã từ chối bài đăng'
      );
      
      setRejectionReason('');
      onClose();
    } catch (error) {
      console.error('Error updating post status:', error);
      toastManager.showError('Không thể cập nhật trạng thái bài đăng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Đang chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="success">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="error">Đã từ chối</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return; // Don't close if submitting
    }
    onClose();
  };

  // Render placeholder khi không có bài đăng
  if (!post) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chi tiết bài đăng"
      size="xl"
    >
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          {getStatusBadge(post.status)}
        </div>
        <p className="text-gray-600 text-sm">
          Kiểm tra nội dung bài đăng trước khi duyệt hoặc từ chối
        </p>
      </div>

      <div className="space-y-6">
          {/* Tiêu đề và thông tin cơ bản */}
          <div>
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <div>Danh mục: <span className="font-medium">{post.category}</span></div>
              <div>Vị trí: <span className="font-medium">{post.location}</span></div>
              <div>Giá: <span className="font-medium text-green-600">{post.price}</span></div>
              <div>Người đăng: <span className="font-medium">{post.author}</span></div>
              <div>Ngày đăng: <span className="font-medium">{formatDate(post.submittedAt)}</span></div>
            </div>
          </div>

          {/* Ảnh bài đăng */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Hình ảnh</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {post.images.map((image, index) => (
                  <div key={index} className="relative h-48 rounded-md overflow-hidden border">
                    <Image 
                      src={image} 
                      alt={`Ảnh ${index + 1} của bài đăng`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mô tả */}
          <div className="space-y-2">
            <h3 className="font-medium">Mô tả</h3>
            <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {post.description || 'Không có mô tả'}
            </div>
          </div>

          {/* Hiển thị lý do từ chối nếu có */}
          {post.status === 'rejected' && post.reason && (
            <div className="space-y-2">
              <h3 className="font-medium text-red-600">Lý do từ chối</h3>
              <div className="bg-red-50 p-3 rounded-md text-red-700 border border-red-200">
                {post.reason}
              </div>
            </div>
          )}

          {/* Form từ chối nếu bài đăng đang chờ duyệt */}
          {post.status === 'pending' && (
            <div className="space-y-2">
              <h3 className="font-medium">Lý do từ chối (nếu từ chối)</h3>
              <textarea
                ref={reasonRef}
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối bài đăng này (bắt buộc nếu từ chối)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Button onClick={handleClose} variant="secondary" disabled={isSubmitting}>
            Đóng
          </Button>
          
          {post.status === 'pending' && (
            <div className="flex space-x-3">
              <Button 
                onClick={() => handleStatusChange('rejected')}
                variant="danger"
                disabled={isSubmitting}
                leftIcon={<XMarkIcon className="w-5 h-5" />}
              >
                Từ chối
              </Button>
              
              <Button 
                onClick={() => handleStatusChange('approved')}
                variant="primary"
                disabled={isSubmitting}
                leftIcon={<CheckIcon className="w-5 h-5" />}
              >
                Duyệt
              </Button>
            </div>
          )}
        </div>
    </Modal>
  );
}