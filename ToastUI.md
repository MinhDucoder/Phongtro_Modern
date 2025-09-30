import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// -------------------------------
// Modern Toast UI (React + Tailwind)
// - Variants: success, error, warning, info
// - Features: queue, auto-dismiss, pause-on-hover, progress bar, close button,
//   swipe-to-dismiss (drag), accessible live region, dark-mode ready
// - Single-file, drop-in component for Next.js/React (Tailwind required)
// -------------------------------

// Types
export type ToastVariant = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

// Context
const ToastContext = createContext<{
  add: (t: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
}>({ add: () => "", remove: () => {} });

// Hook
export const useToast = () => useContext(ToastContext);

// Provider
export default function ToastDemo() {
  return (
    <ToastProvider>
      <DemoPanel />
      <ToastViewport />
    </ToastProvider>
  );
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const add = (t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: Toast = {
      id,
      duration: 4000,
      variant: "info",
      ...t,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  };

  const value = useMemo(() => ({ add, remove }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastManager toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// Viewport (positioning container)
function ToastViewport() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* bottom-right */}
      <div className="absolute bottom-4 right-4 flex w-full max-w-sm flex-col gap-3 md:gap-3">
        {/* The ToastManager renders into this area via portal-like layout since it's in the tree */}
      </div>
    </div>
  );
}

// Colors based on variant
const variantStyles: Record<ToastVariant, { ring: string; bg: string; icon: React.ReactNode; title: string }>= {
  success: {
    ring: "ring-emerald-400/40",
    bg: "bg-emerald-600/90 dark:bg-emerald-600/90",
    icon: <CheckCircle className="h-5 w-5" aria-hidden />,
    title: "Success",
  },
  error: {
    ring: "ring-rose-400/40",
    bg: "bg-rose-600/90 dark:bg-rose-600/90",
    icon: <XCircle className="h-5 w-5" aria-hidden />,
    title: "Error",
  },
  warning: {
    ring: "ring-amber-400/50",
    bg: "bg-amber-500/90 dark:bg-amber-500/90",
    icon: <AlertTriangle className="h-5 w-5" aria-hidden />,
    title: "Warning",
  },
  info: {
    ring: "ring-sky-400/40",
    bg: "bg-slate-800/90 dark:bg-slate-800/90",
    icon: <Info className="h-5 w-5" aria-hidden />,
    title: "Info",
  },
};

function ToastManager({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  // Render stack in bottom-right
  return (
    <div className="fixed bottom-4 right-4 z-[110] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => onRemove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { variant = "info", title, description, duration = 4000 } = toast;
  const { bg, ring, icon } = variantStyles[variant];

  const [progress, setProgress] = useState(100);
  const [hover, setHover] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-dismiss with progress bar
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

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120) onClose();
      }}
      className={`pointer-events-auto overflow-hidden rounded-2xl shadow-2xl ring-1 backdrop-blur-xl ${ring}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`flex items-start gap-3 p-4 text-white ${bg}`}>
        <div className="mt-0.5 shrink-0 opacity-90">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">
            {title ?? variantStyles[variant].title}
          </p>
          {description && (
            <p className="mt-1 text-sm/6 text-white/90">
              {description}
            </p>
          )}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="-m-1 rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Progress */}
      <div className="h-1 w-full bg-white/10">
        <div className="h-1 bg-white/70" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

// Demo controls
function DemoPanel() {
  const { add } = useToast();

  const trigger = (variant: ToastVariant) => () =>
    add({
      variant,
      title:
        variant === "success"
          ? "Saved successfully"
          : variant === "error"
          ? "Something went wrong"
          : variant === "warning"
          ? "Heads up"
          : "Information",
      description:
        variant === "success"
          ? "Your changes are live."
          : variant === "error"
          ? "Please try again or contact support."
          : variant === "warning"
          ? "This action can’t be undone."
          : "We’ve updated your workspace.",
      duration: 4200,
    });

  return (
    <div className="min-h-[60vh] grid place-items-center px-6 py-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Modern Toast UI</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Click a button to preview the toast styles. Hover a toast to pause the timer. Drag sideways to dismiss.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={trigger("success")} className="rounded-xl px-4 py-2 text-sm font-medium bg-emerald-600 text-white shadow hover:bg-emerald-500">Success</button>
          <button onClick={trigger("error")} className="rounded-xl px-4 py-2 text-sm font-medium bg-rose-600 text-white shadow hover:bg-rose-500">Error</button>
          <button onClick={trigger("warning")} className="rounded-xl px-4 py-2 text-sm font-medium bg-amber-500 text-white shadow hover:bg-amber-400">Warning</button>
          <button onClick={trigger("info")} className="rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white shadow hover:bg-slate-800">Info</button>
        </div>

        <div className="mt-10 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <p><span className="font-semibold">Usage:</span> Wrap your app with <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">&lt;ToastProvider /&gt;</code> and render <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">&lt;ToastViewport /&gt;</code> once, then call <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">const {'{ add }'} = useToast()</code>.</p>
          <p><span className="font-semibold">API:</span> <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">add({'{'} title, description, variant, duration {'}'})</code></p>
        </div>
      </div>
    </div>
  );
}
