'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast, type ToastType } from '@/src/contexts/ToastContext';
import { Button } from '@properlia/shared/components/ui';

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: typeof CheckCircle }> = {
  success: {
    bg: 'bg-success-soft',
    border: 'border-success/30',
    text: 'text-success',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-danger-soft',
    border: 'border-danger/30',
    text: 'text-danger',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-warning-soft',
    border: 'border-warning/30',
    text: 'text-warning',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-brand-pale',
    border: 'border-brand-blue/30',
    text: 'text-brand-navy',
    icon: Info,
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-overlay ${style.bg} ${style.border} ${style.text} animate-slide-in`}
            role="alert"
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{toast.message}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeToast(toast.id)}
              className="ml-2 size-7 text-current hover:bg-current/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
