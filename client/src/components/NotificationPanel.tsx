import React from 'react';
import { useNotification } from '../hooks/useNotification.ts';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationBanner: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  // Show only the first/latest notification as a banner
  const notification = notifications[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600 shrink-0" />;
      default:
        return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-b border-green-200';
      case 'error':
        return 'bg-red-50 border-b border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-b border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-b border-blue-200';
      default:
        return 'bg-gray-50 border-b border-gray-200';
    }
  };

  const getTitleColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-gray-900';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      className={`w-full ${getStyles(notification.type)} py-4 px-6 animate-slideDown`}
      role="alert"
      aria-live="polite"
      aria-label={`${notification.type}: ${notification.title}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-4">
          {getIcon(notification.type)}
          <div className="flex-1">
            <h3 className={`font-semibold text-base ${getTitleColor(notification.type)}`}>
              {notification.title}
            </h3>
            {notification.message && (
              <p className={`text-sm mt-2 ${getMessageColor(notification.type)}`}>
                {notification.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className={`${getTitleColor(notification.type)} hover:opacity-75 transition-opacity shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded p-1`}
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationBanner;
