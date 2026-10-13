import React from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
