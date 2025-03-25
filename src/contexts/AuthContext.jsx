import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useMessage } from './MessageProvider';
import * as authService from '../services/authService';

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
            if (user) {
                // Check token expiry
                const token = await user.getIdTokenResult();
                const expirationTime = new Date(token.expirationTime).getTime();
                const now = new Date().getTime();

                if (expirationTime <= now) {
                    // Token expired, force logout
                    await logout();
                    showMessage('Session expired. Please login again.', 'warning');
                    return;
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, userData) => {
        try {
            const result = await authService.signup(email, password, userData);
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
            const result = await authService.login(email, password);
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
            await authService.logoutUser();
            showMessage('Signed out successfully', 'success');
        } catch (error) {
            showMessage('Failed to sign out', 'error');
            throw error;
        }
    };

    const forceLogout = async () => {
        try {
            await authService.logoutUser();
            setCurrentUser(null);
            showMessage('Session expired. Please login again.', 'warning');
        } catch (error) {
            console.error('Force logout error:', error);
        }
    };

    const updateUserProfile = async (userData) => {
        try {
            if (!currentUser) throw new Error('No user logged in');
            await authService.updateUserProfile(currentUser, userData);
            showMessage('Profile updated successfully!', 'success');
        } catch (error) {
            showMessage('Failed to update profile', 'error');
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await authService.resetPassword(email);
            showMessage('Password reset email sent!', 'success');
        } catch (error) {
            const message = 
                error.code === 'auth/user-not-found' ? 'No account found with this email' :
                'Failed to send password reset email';
            showMessage(message, 'error');
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await authService.signInWithGoogle();
            showMessage('Signed in with Google successfully!', 'success');
            return result;
        } catch (error) {
            const message =
                error.code === 'auth/popup-closed-by-user' ? 'Sign in cancelled' :
                error.code === 'auth/network-request-failed' ? 'Network error. Please check your connection.' :
                'Failed to sign in with Google';
            showMessage(message, 'error');
            throw error;
        }
    };

    const value = {
        currentUser,
        signup,
        login,
        logout,
        forceLogout,
        loading,
        signInWithGoogle,
        updateUserProfile,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
