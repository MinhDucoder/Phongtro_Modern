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
  showLoginSuccess(userName: string): void {
    const message = `Chào mừng ${userName}!`;
    this.showSuccess(message, { description: 'Đăng nhập thành công' });
  }

  showLogoutSuccess(): void {
    const message = 'Đã đăng xuất thành công!';
    this.showInfo(message, { description: 'Hẹn gặp lại bạn!' });
  }

  showLoginError(message: string): void {
    this.showError(message);
  }

  showSuccess(message: string, options?: { icon?: string; description?: string; duration?: number }): void {
    this.clearAll();
    const toastId = 'success-toast';
    this.activeToasts.add(toastId);

    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-container bg-emerald-500 border-l-4 border-emerald-400`}> 
          <div className="toast-body">
            <div className="toast-icon bg-emerald-400">
              {options?.icon ?? '✓'}
            </div>
            <div className="toast-content">
              <p className="toast-title">{message}</p>
              {options?.description && <p className="toast-description">{options.description}</p>}
            </div>
            <button onClick={() => this.dismiss(t.id, toastId)} className="toast-close">×</button>
          </div>
        </div>
      ),
      {
        duration: options?.duration ?? 3000,
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );
  }

  showError(message: string, options?: { icon?: string; description?: string; duration?: number }): void {
    this.clearAll();
    const toastId = 'error-toast';
    this.activeToasts.add(toastId);

    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-container bg-rose-500 border-l-4 border-rose-400`}>
          <div className="toast-body">
            <div className="toast-icon bg-rose-400">
              {options?.icon ?? '✕'}
            </div>
            <div className="toast-content">
              <p className="toast-title">{message}</p>
              {options?.description && <p className="toast-description">{options.description}</p>}
            </div>
            <button onClick={() => this.dismiss(t.id, toastId)} className="toast-close">×</button>
          </div>
        </div>
      ),
      {
        duration: options?.duration ?? 4000,
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );
  }

  showWarning(message: string, options?: { icon?: string; description?: string; duration?: number }): void {
    this.clearAll();
    const toastId = 'warning-toast';
    this.activeToasts.add(toastId);

    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-container bg-amber-500 border-l-4 border-amber-400`}>
          <div className="toast-body">
            <div className="toast-icon bg-amber-400">
              {options?.icon ?? '⚠️'}
            </div>
            <div className="toast-content">
              <p className="toast-title">{message}</p>
              {options?.description && <p className="toast-description">{options.description}</p>}
            </div>
            <button onClick={() => this.dismiss(t.id, toastId)} className="toast-close">×</button>
          </div>
        </div>
      ),
      {
        duration: options?.duration ?? 3500,
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );
  }

  showInfo(message: string, options?: { icon?: string; description?: string; duration?: number }): void {
    this.clearAll();
    const toastId = 'info-toast';
    this.activeToasts.add(toastId);

    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} toast-container bg-sky-500 border-l-4 border-sky-400`}>
          <div className="toast-body">
            <div className="toast-icon bg-sky-400">
              {options?.icon ?? 'ℹ️'}
            </div>
            <div className="toast-content">
              <p className="toast-title">{message}</p>
              {options?.description && <p className="toast-description">{options.description}</p>}
            </div>
            <button onClick={() => this.dismiss(t.id, toastId)} className="toast-close">×</button>
          </div>
        </div>
      ),
      {
        duration: options?.duration ?? 3000,
        position: 'top-right',
        id: toastId,
        onDismiss: () => this.activeToasts.delete(toastId)
      }
    );
  }

  private dismiss(toastInstanceId: string, toastId: string) {
    toast.dismiss(toastInstanceId);
    this.activeToasts.delete(toastId);
  }
}

// Export singleton instance
export const toastManager = ToastManager.getInstance();
