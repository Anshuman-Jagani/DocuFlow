import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number; }
interface ToastContextType { showToast: (message: string, type: Toast['type'], duration?: number) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: Toast['type'], duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error:   <AlertCircle className="w-4 h-4" />,
    info:    <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
  };
  const styles = {
    success: 'border-[#4ADE80]/20 text-[#4ADE80]',
    error:   'border-[#F87171]/20 text-[#F87171]',
    info:    'border-white/10 text-white/60',
    warning: 'border-[#FBBF24]/20 text-[#FBBF24]',
  };
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border bg-[#0A0A0A] min-w-[280px] max-w-sm animate-slide-in', styles[toast.type])}>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-xs font-medium text-white">{toast.message}</p>
      <button onClick={onClose} className="flex-shrink-0 text-[#333333] hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ToastProvider;
