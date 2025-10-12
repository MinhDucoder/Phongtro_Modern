'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  icon?: ReactNode;
  exclusive?: boolean;
};

type ToastAction = NonNullable<ToastOptions['action']>;

type ToastInternal = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
  icon?: ReactNode;
  createdAt: number;
};

type ToastCommand =
  | { type: 'add'; toast: ToastInternal }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  error: 4000,
  warning: 4000,
  info: 4000,
  loading: Infinity,
};

type ToastPushOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  icon?: ReactNode;
  id?: string;
  exclusive?: boolean;
};

class ToastManager {
  private static instance: ToastManager;
  private subscribers = new Set<(command: ToastCommand) => void>();

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  subscribe(callback: (command: ToastCommand) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  clearAll(): void {
    this.emit({ type: 'clear' });
  }

  dismiss(id: string): void {
    this.emit({ type: 'remove', id });
  }

  showLoginSuccess(userName?: string | null): string {
    return this.showSuccess(userName ? `Chào mừng ${userName}!` : 'Chào mừng trở lại!', {
      description: 'Đăng nhập thành công',
      exclusive: true,
    });
  }

  showLogoutSuccess(): string {
    return this.showInfo('Đã đăng xuất thành công!', {
      description: 'Hẹn gặp lại bạn!',
    });
  }

  showLoginError(message: string): string {
    return this.showError(message);
  }

  showSuccess(message: string, options?: ToastOptions): string {
    return this.showToast('success', message, options);
  }

  showError(message: string, options?: ToastOptions): string {
    return this.showToast('error', message, options);
  }

  showWarning(message: string, options?: ToastOptions): string {
    return this.showToast('warning', message, options);
  }

  showInfo(message: string, options?: ToastOptions): string {
    return this.showToast('info', message, options);
  }

  showLoading(message: string, options?: Omit<ToastOptions, 'duration'>): string {
    return this.showToast('loading', message, { ...options, duration: Infinity });
  }

  async showPromise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> {
    const id = this.showLoading(messages.loading);
    try {
      const result = await promise;
      this.showSuccess(messages.success, { id });
      return result;
    } catch (error) {
      this.showError(messages.error, { id });
      throw error;
    }
  }

  push(options: ToastPushOptions): string {
    const { variant = 'info', title, ...rest } = options;
    return this.showToast(variant, title, rest);
  }

  showCustom(
    options: Partial<Omit<ToastPushOptions, 'title'>> & { title?: string; message?: string }
  ): string {
    const title = options.title ?? options.message ?? 'Thông báo';
    return this.showToast(options.variant ?? 'info', title, options);
  }

  private showToast(variant: ToastVariant, message: string, options?: ToastOptions): string {
    const id = options?.id ?? `${variant}-${Math.random().toString(36).slice(2, 9)}`;

    if (options?.exclusive) {
      this.clearAll();
    } else if (options?.id) {
      this.dismiss(options.id);
    }

    const toast: ToastInternal = {
      id,
      title: options?.title ?? message,
      description: options?.description,
      variant,
      duration: options?.duration ?? DEFAULT_DURATION[variant],
      action: options?.action,
      icon: options?.icon,
      createdAt: Date.now(),
    };

    this.emit({ type: 'add', toast });

    return id;
  }

  private emit(command: ToastCommand) {
    this.subscribers.forEach((callback) => callback(command));
  }
}

export const toastManager = ToastManager.getInstance();

type ToastContextValue = {
  add: (options: ToastPushOptions) => string;
  remove: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((command) => {
      setToasts((prev) => {
        switch (command.type) {
          case 'add':
            return [...prev, command.toast];
          case 'remove':
            return prev.filter((toast) => toast.id !== command.id);
          case 'clear':
            return [];
          default:
            return prev;
        }
      });
    });

    return unsubscribe;
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      add: (options) => toastManager.push(options),
      remove: (id) => toastManager.dismiss(id),
      clear: () => toastManager.clearAll(),
    }),
    []
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

const variantStyles: Record<ToastVariant, { ring: string; bg: string; icon: ReactNode; label: string }> = {
  success: {
    ring: 'ring-emerald-400/40',
    bg: 'bg-emerald-600/90 dark:bg-emerald-600/90',
    icon: <CheckCircle className="h-5 w-5" aria-hidden />,
    label: 'Thành công',
  },
  error: {
    ring: 'ring-red-300/40',
    bg: 'bg-[#dc3545] dark:bg-[#dc3545]',
    icon: <XCircle className="h-5 w-5" aria-hidden />,
    label: 'Có lỗi',
  },
  warning: {
    ring: 'ring-amber-400/50',
    bg: 'bg-amber-500/90 dark:bg-amber-500/90',
    icon: <AlertTriangle className="h-5 w-5" aria-hidden />,
    label: 'Cảnh báo',
  },
  info: {
    ring: 'ring-sky-400/40',
    bg: 'bg-slate-800/90 dark:bg-slate-800/90',
    icon: <Info className="h-5 w-5" aria-hidden />,
    label: 'Thông tin',
  },
  loading: {
    ring: 'ring-slate-400/40',
    bg: 'bg-slate-800/90 dark:bg-slate-800/90',
    icon: <Loader2 className="h-5 w-5 animate-spin" aria-hidden />,
    label: 'Đang xử lý',
  },
};

function ToastViewport({ toasts }: { toasts: ToastInternal[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div className="absolute top-4 right-4 flex w-full max-w-sm flex-col gap-3 md:gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => toastManager.dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastInternal; onClose: () => void }) {
  const { variant, title, description, duration, action, icon } = toast;
  const styles = variantStyles[variant];
  const [progress, setProgress] = useState(100);
  const [hover, setHover] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPersistent = !Number.isFinite(duration) || duration === Infinity;

  // Auto-dismiss with progress bar - theo đúng logic ToastUI.md
  useEffect(() => {
    const total = duration;
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      if (hover) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = ts - (startRef.current ?? ts);
      const pct = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(pct);
      if (elapsed >= total) {
        onClose();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, hover, onClose]);

  const handleAction = useCallback(async () => {
    if (!action) return;
    try {
      await action.onClick();
    } finally {
      onClose();
    }
  }, [action, onClose]);

  return (
    <motion.div
      role="status"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      initial={{ opacity: 0, y: -24, scale: 0.95, rotateX: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -16, 
        scale: 0.95,
        transition: {
          duration: 0.2,
          ease: "easeInOut"
        }
      }}
      layout
      layoutTransition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.02, rotateY: 5 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120) {
          onClose();
        }
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`pointer-events-auto overflow-hidden rounded-xl shadow-2xl ring-1 backdrop-blur-xl ${styles.ring} transform-gpu`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`flex items-start gap-3 p-4 text-white ${styles.bg}`}>
        <div className="mt-0.5 shrink-0 opacity-90">{icon ?? styles.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">{title || styles.label}</p>
              {description && (
            <p className="mt-1 text-sm/6 text-white/90">
              {description}
            </p>
              )}
              {action && (
            <motion.button
              type="button"
              onClick={handleAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                >
                  {action.label}
            </motion.button>
              )}
            </div>
        <motion.button
          type="button"
          aria-label="Đóng thông báo"
              onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="-m-1 rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </motion.button>
      </div>
      {/* Progress - theo đúng ToastUI.md */}
      <div className="h-1 w-full bg-white/10">
        <div 
          className="h-1 bg-white/70 transition-all duration-75 ease-linear" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </motion.div>
  );
}
