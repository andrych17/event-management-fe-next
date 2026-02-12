'use client';

import { useState, useEffect } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Reset to today's date whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayDate());
    }
  }, [isOpen]);

  // Add ESC key support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPreviewUrl = () => {
    // Use the preview page with date parameter
    if (selectedDate) {
      return `/preview?date=${selectedDate}`;
    }
    // Default to today's events
    return '/preview';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-6xl h-[95dvh] sm:h-[90vh] flex flex-col rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Preview Event Display
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Date Selector */}
            <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
              Tanggal:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDate()}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="ml-auto sm:ml-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Content - Iframe */}
        <div className="flex-1 relative bg-gray-100">
          <iframe
            key={selectedDate || 'default'}
            src={getPreviewUrl()}
            className="absolute inset-0 w-full h-full border-0"
            title="Event Display Preview"
          />
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-none sm:rounded-b-2xl">
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            Live preview tampilan publik
          </p>
        </div>
      </div>
    </div>
  );
}
