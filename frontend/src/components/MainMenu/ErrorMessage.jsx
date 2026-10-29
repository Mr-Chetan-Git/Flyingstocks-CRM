import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="glass-card max-w-lg mx-auto p-8 rounded-2xl text-center border-red-200 dark:border-red-900/40 my-12">
      <div className="w-14 h-14 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        Unable to load AI Products
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {message || "We encountered an issue communicating with the backend API."}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} icon={RefreshCw}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
