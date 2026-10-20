'use client';

import { useEffect, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, className, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-2xl',
          className
        )}
        onClick={event => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
