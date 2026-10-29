import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading AI Products..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-900/40 animate-ping opacity-25"></div>
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin absolute inset-0 m-auto" />
      </div>
      <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
