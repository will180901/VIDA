'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  const typeConfig = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-3 p-6 pb-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
                  <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 font-heading">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 text-xs font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonBg}`}
                >
                  {isLoading ? 'Chargement...' : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
