import React, { useCallback } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'error';
}

export const ConfirmModal = React.memo<ConfirmModalProps>(({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isOpen) return null;

  const colorClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const buttonClasses = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    error: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        <div className={`p-4 rounded-xl border-2 mb-6 ${colorClasses[type]}`}>
          <p className="text-lg leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-colors active:scale-95 ${buttonClasses[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmModal.displayName = 'ConfirmModal';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onClose: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export const AlertModal = React.memo<AlertModalProps>(({
  isOpen,
  title,
  message,
  confirmText = '好的',
  onClose,
  type = 'info'
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const colorClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const buttonClasses = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    error: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700'
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{icons[type]}</span>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>

        {/* Message */}
        <div className={`p-4 rounded-xl border-2 mb-6 ${colorClasses[type]}`}>
          <p className="text-lg leading-relaxed">{message}</p>
        </div>

        {/* Button */}
        <button
          onClick={handleClose}
          className={`w-full px-4 py-3 text-white rounded-xl font-bold transition-colors active:scale-95 ${buttonClasses[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
});

AlertModal.displayName = 'AlertModal';
