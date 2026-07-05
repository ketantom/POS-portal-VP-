'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Auto-dismiss timer for each toast
  useEffect(() => {
    if (toasts.length === 0) return;

    const latestToast = toasts[toasts.length - 1];
    if (latestToast.exiting) return;

    const timer = setTimeout(() => {
      removeToast(latestToast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const iconColors: Record<ToastType, string> = {
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#2563EB',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
            style={{
              animation: toast.exiting
                ? 'toastSlideOut 0.3s ease forwards'
                : 'toastSlideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
            }}
          >
            <span
              style={{
                fontSize: '1.1rem',
                color: iconColors[toast.type],
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: toast.type === 'success' ? '#DCFCE7'
                  : toast.type === 'error' ? '#FEE2E2'
                  : toast.type === 'warning' ? '#FEF3C7'
                  : '#DBEAFE',
                flexShrink: 0,
              }}
            >
              {icons[toast.type]}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Exit animation keyframes injected inline */}
      <style jsx global>{`
        @keyframes toastSlideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
