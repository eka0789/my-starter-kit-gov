'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function PageErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 text-center')}
      role="alert"
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {error.message ?? 'Kesalahan tidak diketahui. Silakan coba lagi.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Coba Lagi
      </button>
    </div>
  );
}