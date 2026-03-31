import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // null for permanent
  timestamp: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  notifySuccess: (title: string, message?: string, duration?: number) => string;
  notifyError: (title: string, message?: string, duration?: number) => string;
  notifyWarning: (title: string, message?: string, duration?: number) => string;
  notifyInfo: (title: string, message?: string, duration?: number) => string;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutIdsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timeoutId = timeoutIdsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIdsRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback(
    (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
      const id = `notif-${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        ...notificationData,
        id,
        timestamp: Date.now(),
        duration: notificationData.duration ?? (notificationData.type === 'error' ? 5000 : 4000),
      };

      setNotifications((prev) => [notification, ...prev]);

      if (notification.duration !== null) {
        const timeoutId = setTimeout(() => {
          removeNotification(id);
        }, notification.duration);
        timeoutIdsRef.current.set(id, timeoutId);
      }

      return id;
    },
    [removeNotification]
  );

  const notifySuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({
        type: 'success',
        title,
        message,
        duration: duration ?? 4000,
      });
    },
    [addNotification]
  );

  const notifyError = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({
        type: 'error',
        title,
        message,
        duration: duration ?? 5000,
      });
    },
    [addNotification]
  );

  const notifyWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({
        type: 'warning',
        title,
        message,
        duration: duration ?? 4000,
      });
    },
    [addNotification]
  );

  const notifyInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addNotification({
        type: 'info',
        title,
        message,
        duration: duration ?? 4000,
      });
    },
    [addNotification]
  );

  const clearAll = useCallback(() => {
    notifications.forEach((n) => {
      const timeoutId = timeoutIdsRef.current.get(n.id);
      if (timeoutId) clearTimeout(timeoutId);
    });
    timeoutIdsRef.current.clear();
    setNotifications([]);
  }, [notifications]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
