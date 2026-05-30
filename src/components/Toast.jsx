import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastItem = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-rose-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50/90 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/30',
    error: 'bg-rose-50/90 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/30',
    warning: 'bg-amber-50/90 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/30',
    info: 'bg-blue-50/90 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/30',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border glass shadow-lg max-w-sm w-80 animate-slide-in transition-all duration-300 ${bgColors[type]}`}
      role="alert"
    >
      <div>{icons[type]}</div>
      <div className="flex-1 text-sm font-medium text-foreground">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const newToast = { id: Date.now() + Math.random(), message, type };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
