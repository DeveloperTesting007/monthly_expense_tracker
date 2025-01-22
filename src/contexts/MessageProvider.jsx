import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

export const MessageContext = React.createContext();

export function useMessage() {
  const showMessage = React.useCallback((message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  }, []);

  return { showMessage };
}

export function MessageProvider({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
      {children}
    </>
  );
}
