import React from 'react';
import { useNotification } from '../hooks/useNotification.ts';

export const NotificationExample: React.FC = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Notification Examples</h2>

      <button
        onClick={() => notifySuccess('Success!', 'Operation completed successfully')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Success Notification
      </button>

      <button
        onClick={() => notifyError('Error', 'Something went wrong. Please try again.')}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Error Notification
      </button>

      <button
        onClick={() => notifyWarning('Warning', 'Please review this action carefully')}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
      >
        Warning Notification
      </button>

      <button
        onClick={() => notifyInfo('Info', 'New update is available')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Info Notification
      </button>
    </div>
  );
};
