import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useMessage } from './MessageProvider';
import { AuthService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useMessage();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && await AuthService.checkTokenExpiration(user)) {
                await handleLogout();
                showMessage('Session expired. Please login again.', 'warning');
                return;
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [showMessage]);

    const handleAuth = async (operation, ...args) => {
        try {
            const result = await operation(...args);
            const message = result?.message || 'Operation completed successfully';
            showMessage(message, 'success');
            return result;
        } catch (error) {
            const errorMessage = error?.message || 'An error occurred';
            showMessage(errorMessage, 'error');
            throw error;
        }
    };

    const signup = async (email, password, userData) => {
        const result = await handleAuth(() => AuthService.signUp(email, password, userData));
        if (result?.user) {
            setCurrentUser(result.user);
        }
        return result;
    };

    const login = (email, password) => 
        handleAuth(() => AuthService.login(email, password));

    const loginWithGoogle = () => 
        handleAuth(() => AuthService.loginWithGoogle());

    const handleLogout = () => 
        handleAuth(AuthService.logout);

    const resetPassword = (email) => 
        handleAuth(() => AuthService.resetPassword(email));

    const updateUserProfile = (userData) => 
        handleAuth(() => AuthService.updateUserProfile(currentUser, userData));

    const value = {
        currentUser,
        signup,
        login,
        logout: handleLogout,
        loading,
        loginWithGoogle,
        updateUserProfile,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
