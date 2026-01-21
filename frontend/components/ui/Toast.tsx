'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastConfig = {
  success: {
    icon: Check,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    text: 'text-emerald-800',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    text: 'text-red-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    text: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    text: 'text-amber-800',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Haut centre */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-200 ${config.bg} ${config.border}`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${config.iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
              </div>
              <span className={`text-xs font-medium ${config.text}`}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className={`ml-2 p-0.5 rounded hover:bg-black/5 transition-colors ${config.text}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
