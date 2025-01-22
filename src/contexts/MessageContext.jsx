import React, { createContext, useContext, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { auth } from '../config/firebase';
import { useMessage } from './MessageProvider';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const { showMessage } = useMessage();

  const signup = async (email, password) => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      showMessage('Signup successful!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const login = async (email, password) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      showMessage('Login successful!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const value = {
    currentUser,
    signup,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

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
