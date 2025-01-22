import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useMessage } from './MessageProvider';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useMessage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      showMessage('Account created successfully!', 'success');
      return result;
    } catch (error) {
      const message = 
        error.code === 'auth/email-already-in-use' ? 'An account already exists with this email' :
        error.code === 'auth/invalid-email' ? 'Invalid email address' :
        'Failed to create account';
      showMessage(message, 'error');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      showMessage('Signed in successfully!', 'success');
      return result;
    } catch (error) {
      const message = 
        error.code === 'auth/user-not-found' ? 'No account found with this email' :
        error.code === 'auth/wrong-password' ? 'Incorrect password' :
        'Failed to sign in';
      showMessage(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showMessage('Signed out successfully', 'success');
    } catch (error) {
      showMessage('Failed to sign out', 'error');
      throw error;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
