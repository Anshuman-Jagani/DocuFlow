import React, { useEffect, type ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean; onClose: () => void; title?: string; children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up', sizes[size])}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#111111]">
            {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
            {showCloseButton && (
              <button onClick={onClose}
                className="text-[#333333] hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#111111]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5 text-white">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
