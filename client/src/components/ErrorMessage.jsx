import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'An error occurred while loading content.',
  onRetry,
}) {
  return (
    <div className="bg-red-50/80 border border-red-200 rounded-3xl p-6 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-lg font-bold text-red-900 mb-1">{title}</h3>
      <p className="text-sm text-red-700 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
