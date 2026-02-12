import { useState, useCallback } from 'react';

export interface Notification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showSuccess = useCallback((title: string, message: string) => {
    setNotification({ type: 'success', title, message });
  }, []);

  const showError = useCallback((title: string, message: string) => {
    setNotification({ type: 'error', title, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    clearNotification,
  };
};
