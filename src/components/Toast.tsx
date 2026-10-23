import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="font-medium">{toast.text}</span>

      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            clearToast();
          }}
          className="ml-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={clearToast}
        className="p-1 text-slate-400 hover:text-slate-200 transition-colors ml-1"
        aria-label="Dismiss toast notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
