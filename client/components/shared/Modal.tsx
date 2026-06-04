'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Rendered inside the heading; supports the `<span>` accent styling used across HRM. */
  title?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  showClose?: boolean;
}

/**
 * Shared animated modal shell used across the admin surfaces.
 * Owns the backdrop, enter/exit animation, container chrome and close affordance
 * so individual pages only describe their body content.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = 'max-w-lg',
  showClose = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full ${maxWidthClassName} bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8`}
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {title && (
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic pr-10">
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
