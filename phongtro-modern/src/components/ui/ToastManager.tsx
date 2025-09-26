'use client';

import { toast } from 'react-hot-toast';

// Toast Manager để quản lý toasts chuyên nghiệp
export class ToastManager {
  private static instance: ToastManager;
  private activeToasts: Set<string> = new Set();

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  // Clear all toasts
  clearAll(): void {
    toast.dismiss();
    this.activeToasts.clear();
  }

  // Show login success toast
  showLoginSuccess(userName: string, isAdmin: boolean = false): void {
    this.clearAll();
    
    const toastId = 'login-success';
    this.activeToasts.add(toastId);
    
    const durationMs = 3000;
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full ${isAdmin ? 'bg-purple-600' : 'bg-green-500'} shadow-lg rounded-lg pointer-events-auto flex items-center border-l-4 ${isAdmin ? 'border-purple-400' : 'border-green-400'} toast-hover`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center p-4 w-full">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-purple-500' : 'bg-green-400'} toast-icon-success`}>
                <span role="img" aria-label="success" className="text-sm">✓</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {isAdmin ? 'Chào mừng Admin!' : `Chào mừng ${userName}!`}
              </p>
              <p className="text-xs text-white/80 mt-1">
                {isAdmin ? 'Đăng nhập admin thành công' : 'Đăng nhập thành công'}
              </p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                this.activeToasts.delete(toastId);
              }}
              className="ml-2 flex items-center justify-center text-white/70 hover:text-white focus:outline-none transition-colors"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ),
      { 
        duration: durationMs, 
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );

    // Force dismiss to avoid being stuck when hovered
    setTimeout(() => {
      toast.dismiss(toastId);
    }, durationMs + 100);
  }

  // Show logout success toast
  showLogoutSuccess(): void {
    this.clearAll();
    
    const toastId = 'logout-success';
    this.activeToasts.add(toastId);
    
    const durationMs = 2500;
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-blue-600 shadow-lg rounded-lg pointer-events-auto flex items-center border-l-4 border-blue-400 toast-hover`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center p-4 w-full">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 toast-icon">
                <span role="img" aria-label="logout" className="text-sm">👋</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                Đã đăng xuất thành công!
              </p>
              <p className="text-xs text-white/80 mt-1">
                Hẹn gặp lại bạn!
              </p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                this.activeToasts.delete(toastId);
              }}
              className="ml-2 flex items-center justify-center text-white/70 hover:text-white focus:outline-none transition-colors"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ),
      { 
        duration: durationMs, 
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );

    // Force dismiss to avoid being stuck when hovered
    setTimeout(() => {
      toast.dismiss(toastId);
    }, durationMs + 100);
  }

  // Show login error toast
  showLoginError(message: string): void {
    this.clearAll();
    
    const toastId = 'login-error';
    this.activeToasts.add(toastId);
    
    toast.error(message, {
      icon: '🔐',
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dc2626',
      },
      position: 'top-right',
      id: toastId,
      onDismiss: () => this.activeToasts.delete(toastId),
      iconTheme: {
        primary: 'white',
        secondary: '#ef4444'
      }
    });
  }

  // Show success toast
  showSuccess(message: string, icon: string = '✓'): void {
    this.clearAll();
    
    const toastId = 'success-toast';
    this.activeToasts.add(toastId);
    
    toast.success(message, {
      icon,
      duration: 3000,
      style: {
        background: '#10b981',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #059669',
      },
      position: 'top-right',
      id: toastId,
      onDismiss: () => this.activeToasts.delete(toastId),
    });
  }

  // Show error toast
  showError(message: string, icon: string = '✕'): void {
    this.clearAll();
    
    const toastId = 'error-toast';
    this.activeToasts.add(toastId);
    
    toast.error(message, {
      icon,
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dc2626',
      },
      position: 'top-right',
      id: toastId,
      onDismiss: () => this.activeToasts.delete(toastId),
      iconTheme: {
        primary: 'white',
        secondary: '#ef4444'
      }
    });
  }

  // Show warning toast
  showWarning(message: string): void {
    this.clearAll();
    
    const toastId = 'warning-toast';
    this.activeToasts.add(toastId);
    
    toast(message, {
      icon: '⚠️',
      duration: 3500,
      style: {
        background: '#f59e0b',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #d97706',
      },
      position: 'top-right',
      id: toastId,
      onDismiss: () => this.activeToasts.delete(toastId),
    });
  }

  // Show info toast
  showInfo(message: string): void {
    this.clearAll();
    
    const toastId = 'info-toast';
    this.activeToasts.add(toastId);
    
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        background: '#3b82f6',
        color: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #2563eb',
      },
      position: 'top-right',
      id: toastId,
      onDismiss: () => this.activeToasts.delete(toastId),
    });
  }
}

// Export singleton instance
export const toastManager = ToastManager.getInstance();
