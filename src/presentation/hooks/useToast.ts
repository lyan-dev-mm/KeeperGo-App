import { useState, useCallback } from 'react';
import { ToastType } from '../components/common/CustomToast';

export const useToast = () => {
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToastConfig({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toastConfig,
    showToast,
    hideToast,
  };
};
