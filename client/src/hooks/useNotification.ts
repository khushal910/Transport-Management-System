import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext.tsx';
import type { NotificationContextType } from '../context/NotificationContext.tsx';

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
